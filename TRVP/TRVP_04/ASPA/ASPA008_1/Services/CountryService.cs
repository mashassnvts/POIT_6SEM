using Microsoft.AspNetCore.Mvc.Rendering;
using ANC25_WEBAPI_DLL.Models;
namespace ASPA008_1.Services
{
    public class CountryService : ICountryService
    {
        private readonly CountryCodes _countryCodes;

        public CountryService(CountryCodes countryCodes)
        {
            _countryCodes = countryCodes;
        }

        public SelectList GetCountryList()
        {
            return new SelectList(_countryCodes, "code", "countryLabel");
        }

        public string GetCountryName(string code)
        {
            var country = _countryCodes.FirstOrDefault(c => c.code == code);
            return country?.countryLabel ?? code;
        }
    }
} 