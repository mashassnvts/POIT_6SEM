using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using DAL_Celebrity;

namespace ASPA008_1.Views.Celebrities
{
    public class EditModel : PageModel
    {
        public Celebrity Celebrity { get; set; }
        public SelectList CountryList { get; set; }
        public string PhotosRequestPath { get; set; }

        public void OnGet()
        {
        }
    }
}
