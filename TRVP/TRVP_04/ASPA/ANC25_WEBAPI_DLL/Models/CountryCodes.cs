using System.Collections.Generic;
using System.Collections;

namespace ANC25_WEBAPI_DLL.Models
{
    public class CountryCodes : IEnumerable<CountryCode>
    {
        public List<CountryCode> Codes { get; set; } = new List<CountryCode>();

        public IEnumerator<CountryCode> GetEnumerator()
        {
            return Codes.GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }

        public int Count => Codes.Count;
    }

    public class CountryCode
    {
        public string countryLabel { get; set; }
        public string code { get; set; }
    }
} 