using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;

namespace DAL004
{
    public class Repository : IRepository
    {
        private List<Celebrity> _celebrities = new List<Celebrity>();
        private readonly string _basePath;

        public static string JSONFileName { get; set; } = "data.json";

        public Repository(string basePath)
        {
            _basePath = basePath;
            LoadData();
        }

        public string BasePath => _basePath;

        public static IRepository Create(string basePath)
        {
            return new Repository(basePath);
        }

        public Celebrity[] getAllCelebrities() => _celebrities.ToArray();

        public Celebrity? getCelebrityById(int id) => _celebrities.FirstOrDefault(c => c.Id == id);

        public Celebrity[] getCelebritiesBySurname(string surname) =>
            _celebrities.Where(c => c.Surname.Equals(surname, StringComparison.OrdinalIgnoreCase)).ToArray();

        public string? getPhotoPathById(int id) => getCelebrityById(id)?.PhotoPath;

        public int? addCelebrity(Celebrity celebrity)
        {
            if (celebrity.Id == 0)
            {
                int newId = _celebrities.Any() ? _celebrities.Max(c => c.Id) + 1 : 1;
                celebrity = new Celebrity(newId, celebrity.Firstname, celebrity.Surname, celebrity.PhotoPath);
            }

            if (_celebrities.Any(c => c.Id == celebrity.Id))
                return null;

            _celebrities.Add(celebrity);
            return celebrity.Id;
        }

        public bool updCelebrityById(int id, Celebrity updatedCelebrity)
        {
            var existingCelebrity = getCelebrityById(id);
            if (existingCelebrity == null) return false;

            _celebrities.Remove(existingCelebrity);
            _celebrities.Add(new Celebrity(id, updatedCelebrity.Firstname, updatedCelebrity.Surname, updatedCelebrity.PhotoPath));
            return true;
        }

        public bool delCelebrityById(int id)
        {
            var celebrity = getCelebrityById(id);
            if (celebrity == null) return false;

            return _celebrities.Remove(celebrity);
        }

        public int SaveChanges()
        {
            var options = new JsonSerializerOptions { WriteIndented = true };
            var json = JsonSerializer.Serialize(_celebrities, options);
            File.WriteAllText(Path.Combine(_basePath, JSONFileName), json);
            return _celebrities.Count;
        }

        private void LoadData()
        {
            var filePath = Path.Combine(_basePath, JSONFileName);
            if (File.Exists(filePath))
            {
                var json = File.ReadAllText(filePath);
                _celebrities = JsonSerializer.Deserialize<List<Celebrity>>(json) ?? new List<Celebrity>();
            }
        }

        public void Dispose()
        {
            // Clean up if necessary
        }
    }
}