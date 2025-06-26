using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace ANC25_WEBAPI_DLL.ViewModels
{
    public class NewCelebrityModel
    {
        [Required(ErrorMessage = "введите полное имя")]
        public string FullName { get; set; }

        [Required(ErrorMessage = "выберите национальность")]
        public string Nationality { get; set; }

        [Required(ErrorMessage = "выберите фотографию")]
        [DataType(DataType.Upload)]
        public IFormFile Photo { get; set; }

        [ValidateNever]
        public SelectList CountryList { get; set; }
    }

    public class ConfirmCelebrityModel
    {
        public string TempFileName { get; set; }
        public string FullName { get; set; }
        public string NationalityCode { get; set; }
        public string NationalityName { get; set; }
        public string TempPhotoUrl { get; set; }
    }

    public class DeleteCelebrityViewModel
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Nationality { get; set; }
        public string PhotoPath { get; set; }
        public string PhotoRequestPath { get; set; }
        public string CountryName { get; set; }
    }
}