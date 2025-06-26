using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace ASPA008_1.Helpers
{
    public static class CelebrityHelpers
    {
       
        public static HtmlString CelebrityPhoto(this IHtmlHelper html, int id, string title, string src)
        {
            string result = $@"
        <div class=""celebrity-item"">
            <a href=""/Celebrities/Human/{id}"">
                <img src=""{src}""
                     alt=""{title}""
                     class=""celebrity-image""
                     width=""235"" height=""235"" />
            </a>
        </div>";

            return new HtmlString(result);
        }
    }
}