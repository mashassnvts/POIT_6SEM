using System.ComponentModel.DataAnnotations;

namespace ASP006_1
{
    public class CelebritiesConfig
    {
        public required string PhotosFolder { get; set; }
        public required string ConnectionString { get; set; }
    }
}
