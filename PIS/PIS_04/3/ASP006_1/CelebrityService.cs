using ASP006_1;
using DAL_Celebrity;
using Microsoft.Extensions.Options;

namespace ASP006_1
{
    public interface ICelebrityService
    {
        List<Celebrity> GetAllCelebrities();
        Celebrity? GetCelebrityById(int id);
        Celebrity? GetCelebrityByLifeeventId(int lifeeventId);
        bool DeleteCelebrity(int id);
        int CreateCelebrity(Celebrity celebrity);
        bool UpdateCelebrity(int id, Celebrity celebrity);
        Task<Stream?> GetCelebrityPhotoAsync(string fileName);

        List<Lifeevent> GetAllLifeevents();
        Lifeevent? GetLifeeventById(int id);
        List<Lifeevent> GetLifeeventsByCelebrityId(int celebrityId);
        bool DeleteLifeevent(int id);
        int CreateLifeevent(Lifeevent lifeevent);
        bool UpdateLifeevent(int id, Lifeevent lifeevent);
    }

    public class CelebrityService : ICelebrityService
    {
        private readonly IRepository<Celebrity, Lifeevent> _repository;
        private readonly CelebritiesConfig _config;

        public CelebrityService(
            IRepository<Celebrity, Lifeevent> repository,
            IOptions<CelebritiesConfig> config)
        {
            _repository = repository;
            _config = config.Value;
        }

        public List<Celebrity> GetAllCelebrities() => _repository.GetAllCelebrities();

        public Celebrity? GetCelebrityById(int id) => _repository.GetCelebrityById(id);

        public Celebrity? GetCelebrityByLifeeventId(int lifeeventId) =>
            _repository.GetCelebrityByLifeeventId(lifeeventId);

        public bool DeleteCelebrity(int id) => _repository.DelCelebrity(id);

        public int CreateCelebrity(Celebrity celebrity)
        {
            if (!_repository.AddCelebrity(celebrity))
                return 0;
            return celebrity.Id;
        }

        public bool UpdateCelebrity(int id, Celebrity celebrity) =>
            _repository.UpdCelebrity(id, celebrity);

        public async Task<Stream?> GetCelebrityPhotoAsync(string fileName)
        {
            var safeFileName = Path.GetFileName(fileName);
            var filePath = Path.Combine(_config.PhotosFolder, safeFileName);

            if (!File.Exists(filePath))
                return null;

            return File.OpenRead(filePath);
        }

        public List<Lifeevent> GetAllLifeevents() => _repository.GetAllLifeevents();

        public Lifeevent? GetLifeeventById(int id) => _repository.GetLifeevetById(id);

        public List<Lifeevent> GetLifeeventsByCelebrityId(int celebrityId) =>
            _repository.GetLifeeventsByCelebrityId(celebrityId);

        public bool DeleteLifeevent(int id) => _repository.DelLifeevent(id);

        public int CreateLifeevent(Lifeevent lifeevent)
        {
            if (!_repository.AddLifeevent(lifeevent))
                return 0;
            return lifeevent.Id;
        }

        public bool UpdateLifeevent(int id, Lifeevent lifeevent) =>
            _repository.UpdLifeevent(id, lifeevent);
    }
}