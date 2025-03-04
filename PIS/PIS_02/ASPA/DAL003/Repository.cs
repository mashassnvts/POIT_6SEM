using DAL003;
using System.Text.Json;

public class Repository : IRepository
{
    private readonly string _jsonFileName;  
    private readonly string _directory;
    private List<Celebrity> _celebrities;  

    public string BasePath => _directory;


    public Repository(string directory, string jsonFileName)
    {
        _directory = directory;
        _jsonFileName = jsonFileName;
        _celebrities = new List<Celebrity>();
        LoadData();
    }


    private void LoadData()
    {
        var jsonFilePath = Path.Combine(_directory, _jsonFileName);
        if (File.Exists(jsonFilePath))
        {
            try
            {
                var json = File.ReadAllText(jsonFilePath);
                _celebrities = JsonSerializer.Deserialize<List<Celebrity>>(json) ?? new List<Celebrity>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading data from JSON: {ex.Message}");
                _celebrities = new List<Celebrity>();
            }
        }
        else
        {
            _celebrities = new List<Celebrity>();
        }
    }


    public Celebrity[] GetAllCelebrities() => _celebrities.ToArray();

    public Celebrity? getCelebrityById(int id) => _celebrities.FirstOrDefault(c => c.Id == id);

    public Celebrity[] GetCelebritiesBySurname(string surname) =>
        _celebrities.Where(c => c.Surname.Equals(surname, StringComparison.OrdinalIgnoreCase)).ToArray();

    public string? getPhotoPathById(int id)
    {
        var celebrity = getCelebrityById(id);
        return celebrity?.PhotoPath;
    }

    public void Dispose()
    {
        
    }

    public static Repository Create(string directory, string jsonFileName)
    {
        return new Repository(directory, jsonFileName);
    }
}
