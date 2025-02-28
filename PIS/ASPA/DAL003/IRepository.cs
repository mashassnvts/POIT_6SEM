using System;
using System.Collections.Generic;

namespace DAL003
{
    public interface IRepository : IDisposable
    {
        string BasePath { get; } 
        Celebrity[] GetAllCelebrities();  
        Celebrity? getCelebrityById(int id);
        Celebrity[] GetCelebritiesBySurname(string surname); 
        string? getPhotoPathById(int id);
    }

    public record Celebrity(int Id, string Firstname, string Surname, string PhotoPath);
}
