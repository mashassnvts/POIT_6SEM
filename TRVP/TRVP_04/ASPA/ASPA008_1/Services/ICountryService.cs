using Microsoft.AspNetCore.Mvc.Rendering;

namespace ASPA008_1.Services
{
    public interface ICountryService
    {
        SelectList GetCountryList();
        string GetCountryName(string code);
    }
} 