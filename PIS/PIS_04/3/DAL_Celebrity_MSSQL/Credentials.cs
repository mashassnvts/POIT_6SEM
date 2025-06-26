namespace DAL_Celebrity_EF
{
    public class Credentials
    {
        public string ConnectionString { get; set; }

        public Credentials(string connectionString)
        {
            ConnectionString = connectionString;
        }
    }
}