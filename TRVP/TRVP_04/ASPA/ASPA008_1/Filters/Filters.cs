using DAL_Celebrity;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Text.Json;

namespace ASPA008_1.Filters
{
    public class InfoAsyncActionFilter : Attribute, IAsyncActionFilter
    {
        public static readonly string Wikipedia = "WIKI";
        public static readonly string Facebook = "FACE";
        string infotype;

        public InfoAsyncActionFilter(string infotype = ""){this.infotype = infotype.ToUpper();}

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var repo = context.HttpContext.RequestServices.GetService<IRepository<Celebrity, Lifeevent>>();
            int id = (int)(context.ActionArguments["id"] ?? -1);
            var celebrity = repo?.GetCelebrityById(id);
            if (infotype.Contains(Wikipedia) && celebrity != null)
            {
                context.HttpContext.Items.Add(Wikipedia,
                    await WikiInfoCelebrity.GetReferences(celebrity.FullName));
            }
            if (infotype.Contains(Facebook) && celebrity != null)
            {
                context.HttpContext.Items.Add(Facebook, GetFromFace(celebrity.FullName));
            }
            await next();
        }

        string GetFromFace(string fullname) => "Info from Face";
        //запрос
        public class WikiInfoCelebrity
        {
            HttpClient client;
            Dictionary<string, string> wikiReferences;
            string wikiURI;
            private WikiInfoCelebrity(string fullname)
            {
                this.client = new HttpClient();
                this.wikiReferences = new Dictionary<string, string>();
                this.wikiURI = string.Format(
                    "https://en.wikipedia.org/w/api.php?action=opensearch&search=\"{0}\"&prop=info&format=json",
                    fullname);
            }
            public static async Task<Dictionary<string, string>> GetReferences(string fullname)
            {
                var info = new WikiInfoCelebrity(fullname);
                var message = await info.client.GetAsync(info.wikiURI);
                if (message.StatusCode == System.Net.HttpStatusCode.OK)
                {
                    var result = await message.Content.ReadFromJsonAsync<List<dynamic>>();
                    var ls1 = JsonSerializer.Deserialize<List<string>>(result[1].ToString());
                    var ls3 = JsonSerializer.Deserialize<List<string>>(result[3].ToString());
                    for (int i = 0; i < ls1.Count; i++)
                    {
                        info.wikiReferences.Add(ls1[i], ls3[i]);
                    }
                }
                return info.wikiReferences;
            }
        }
    }
}