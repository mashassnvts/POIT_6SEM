using ASPA008_1.Filters;
using DAL_Celebrity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Mvc.Rendering;
using ANC25_WEBAPI_DLL.ViewModels;
using ANC25_WEBAPI_DLL.Models;
using ANC25_WEBAPI_DLL;
using System.Linq;

namespace ASPA008_1.Controllers
{
    public class CelebritiesController : Controller
    {
        private readonly IRepository<Celebrity, Lifeevent> _repository;
        private readonly CelebritiesConfig _config;
        private readonly CountryCodes _countryCodes;
        private readonly CelebrityTitles _titles;
        private readonly ILogger<CelebritiesController> _logger;

        public CelebritiesController(
            IRepository<Celebrity, Lifeevent> repository,
            IOptions<CelebritiesConfig> config,
            CountryCodes countryCodes,
            CelebrityTitles titles,
            ILogger<CelebritiesController> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _config = config.Value ?? throw new ArgumentNullException(nameof(config));
            _countryCodes = countryCodes ?? throw new ArgumentNullException(nameof(countryCodes));
            _titles = titles ?? throw new ArgumentNullException(nameof(titles));
            _logger = logger;
            if (!_countryCodes.Codes.Any())
            {
                throw new InvalidOperationException("Country codes collection is empty");
            }
        }

        //строгая типизация
        public IActionResult Index()
        {
            var model = new IndexModel
            {
                PhotosRequestPath = _config.PhotosRequestPath,
                Celebrities = _repository.GetAllCelebrities()
            };
            return View(model);
        }
        //ViewBag динамический объект
        [InfoAsyncActionFilter("WIKI")]
        public IActionResult Human(int id) // /Celebrities/Human/5
        {
            var celebrity = _repository.GetCelebrityById(id);
            if (celebrity == null)
            {
                return NotFound();
            }
            var lifeEvents = _repository.GetLifeeventsByCelebrityId(id);
            ViewBag.PhotosRequestPath = _config.PhotosRequestPath;
            ViewBag.LifeEvents = lifeEvents;
            return View(celebrity);
        }

        [HttpGet]
        public IActionResult NewHumanForm()
        {
            ViewBag.CountryList = new SelectList(_countryCodes, "code", "countryLabel");
            return View(new NewCelebrityModel());
        }

        [HttpPost]
        public async Task<IActionResult> ProcessNewCelebrity(NewCelebrityModel model)
        {
            try
            {
                //через модель (Form Data) данные из формы приходят
                if (model.Photo == null || model.Photo.Length == 0)
                {
                    ModelState.AddModelError("Photo", "Файл не выбран");
                    return View("NewHumanForm", model);
                }
                var tempFileName = $"{Guid.NewGuid()}{Path.GetExtension(model.Photo.FileName)}";
                var tempPath = Path.Combine("wwwroot", "temp", tempFileName);
                _logger.LogInformation($"Сохранение файла: {tempPath}");
                _logger.LogInformation($"Размер файла: {model.Photo.Length} байт");
                _logger.LogInformation($"Тип содержимого: {model.Photo.ContentType}");
                Directory.CreateDirectory(Path.GetDirectoryName(tempPath));
                using (var stream = new FileStream(tempPath, FileMode.Create))
                {
                    await model.Photo.CopyToAsync(stream);
                    await stream.FlushAsync();
                }
                if (!System.IO.File.Exists(tempPath))
                {
                    _logger.LogError("Файл не был сохранён!");
                    ModelState.AddModelError("", "Ошибка сохранения файла");
                    return View("NewHumanForm", model);
                }
                _logger.LogInformation("Файл успешно сохранён");
                var country = _countryCodes.FirstOrDefault(c => c.code == model.Nationality);
                var countryName = country?.countryLabel ?? model.Nationality;
                _logger.LogInformation($"Nationality code: {model.Nationality}");
                _logger.LogInformation($"Country found: {country != null}");
                if (country != null)
                {
                    _logger.LogInformation($"Country label: {country.countryLabel}");
                }
                return RedirectToAction("ConfirmCelebrity", new
                {
                    tempFileName,
                    fullName = model.FullName,
                    nationalityCode = model.Nationality,
                    nationalityName = countryName
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при сохранении файла");
                ModelState.AddModelError("", "Ошибка обработки файла");
                return View("NewHumanForm", model);
            }
        }

        private SelectList GetCountrySelectList()
        {
            return new SelectList(_countryCodes, "code", "countryLabel");
        }

        private void LogValidationErrors()
        {
            var errors = ModelState
                .Where(x => x.Value.Errors.Any())
                .Select(x => $"{x.Key}: {string.Join(", ", x.Value.Errors.Select(e => e.ErrorMessage))}");

            _logger.LogWarning("Ошибки валидации:\n{Errors}", string.Join("\n", errors));
        }

        [HttpGet]
        public IActionResult ConfirmCelebrity(string tempFileName, string fullName, string nationalityCode, string nationalityName)
        {
            var model = new ConfirmCelebrityModel
            {
                TempFileName = tempFileName,
                FullName = fullName,
                NationalityCode = nationalityCode,
                NationalityName = nationalityName,
                TempPhotoUrl = $"/temp/{tempFileName}"
            };
            return View(model);
        }

        [HttpPost]
        public IActionResult FinalizeCelebrity(ConfirmCelebrityModel model)
        {
            try
            {
                var tempPath = Path.Combine("wwwroot", "temp", model.TempFileName);
                var finalPath = Path.Combine("wwwroot", "Photos", model.TempFileName);
                if (System.IO.File.Exists(tempPath))
                {
                    System.IO.File.Move(tempPath, finalPath);
                }
                var celebrity = new Celebrity
                {
                    FullName = model.FullName,
                    Nationality = model.NationalityCode,
                    ReqPhotoPath = model.TempFileName
                };
                _repository.AddCelebrity(celebrity);
                return RedirectToAction("Index", new { message = "Знаменитость успешно добавлена" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при сохранении знаменитости");
                return RedirectToAction("ConfirmCelebrity", new
                {
                    model.TempFileName,
                    model.FullName,
                    model.NationalityCode
                });
            }
        }

        [HttpGet]
        public IActionResult Edit(int id)
        {
            var celebrity = _repository.GetCelebrityById(id);
            if (celebrity == null) return NotFound();

            ViewBag.PhotosRequestPath = _config.PhotosRequestPath;
            ViewBag.CountryList = GetCountrySelectList();
            
            return View(celebrity);
        }

        [HttpPost]
        public IActionResult Edit(int id, Celebrity model, IFormFile NewPhoto)
        {
            try
            {
                var existingCelebrity = _repository.GetCelebrityById(id);
                if (existingCelebrity == null)
                {
                    return NotFound();
                }
                if (NewPhoto == null || NewPhoto.Length == 0)
                {
                    model.ReqPhotoPath = existingCelebrity.ReqPhotoPath;
                }
                else
                {
                    var tempFileName = $"{Guid.NewGuid()}{Path.GetExtension(NewPhoto.FileName)}";
                    var finalPath = Path.Combine("wwwroot", "Photos", tempFileName);
                    using (var stream = new FileStream(finalPath, FileMode.Create))
                    {
                        NewPhoto.CopyTo(stream);
                    }
                    model.ReqPhotoPath = tempFileName;
                }
                if (_repository.UpdCelebrity(id, model))
                {
                    return RedirectToAction("Human", new { id });
                }
                ModelState.AddModelError("", "Failed to update celebrity");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating celebrity");
                ModelState.AddModelError("", "An error occurred while updating");
            }
            ViewBag.PhotosRequestPath = _config.PhotosRequestPath;
            ViewBag.CountryList = GetCountrySelectList();
            return View(model);
        }

        [HttpGet]
        public IActionResult Delete(int id)
        {
            ViewBag.PhotosRequestPath = _config.PhotosRequestPath;
            var celebrity = _repository.GetCelebrityById(id);
            if (celebrity == null) return NotFound();
            var country = _countryCodes.FirstOrDefault(c => c.code == celebrity.Nationality);
            var model = new DeleteCelebrityViewModel
            {
                Id = celebrity.Id,
                FullName = celebrity.FullName,
                Nationality = celebrity.Nationality,
                PhotoPath = celebrity.ReqPhotoPath,
                CountryName = country?.countryLabel ?? celebrity.Nationality
            };
            return View(model);
        }

        [HttpPost]
        [ActionName("DeleteConfirmed")]
        public IActionResult DeleteConfirmed(int id)
        {
            if (_repository.DelCelebrity(id))
            {
                return RedirectToAction("Index");
            }
            return RedirectToAction("Human", new { id });
        }

        public class IndexModel
        {
            public string PhotosRequestPath { get; set; }
            public IEnumerable<Celebrity> Celebrities { get; set; }
        }
    }
}