using DAL_Celebrity;
using Microsoft.EntityFrameworkCore;

namespace DAL_Celebrity_MSSQL
{
    public class Init
    {
        static string connstring = @"Data Source=MASHA;Initial Catalog=MSSQLLocalDB;Integrated Security=True;TrustServerCertificate=True;";
        public Init() { }
        public Init(string conn) { connstring = conn; }

        public static void Execute(bool delete = true, bool create = true)
        {
            using var context = new CelebrityContext(connstring);
            if (delete)
            {
                context.Database.EnsureDeleted();   
            }
            if (create)
            {
                context.Database.EnsureCreated(); 

                Func<string, string> puri = (string f) => $"{f}";

                var c1 = new Celebrity() { FullName = "Noam Chomsky", Nationality = "US", ReqPhotoPath = puri("Chomsky.jpg") };
                context.Celebrities.Add(c1);
                context.SaveChanges();
                var l1_1 = new Lifeevent() { CelebrityId = c1.Id, Date = new DateTime(1928, 12, 7), Description = "Дата рождения", ReqPhotoPath = null };
                var l1_2 = new Lifeevent()
                {
                    CelebrityId = c1.Id,
                    Date = new DateTime(1955, 1, 1),
                    Description = "Издание книги \"Логическая структура лингвистической теории\"",
                    ReqPhotoPath = null
                };
                context.Lifeevents.Add(l1_1);
                context.Lifeevents.Add(l1_2);

                var c2 = new Celebrity() { FullName = "Tim Berners-Lee", Nationality = "UK", ReqPhotoPath = puri("Berners-Lee.jpg") };
                context.Celebrities.Add(c2);
                context.SaveChanges();
                var l2_1 = new Lifeevent() { CelebrityId = c2.Id, Date = new DateTime(1955, 6, 8), Description = "Дата рождения", ReqPhotoPath = null };
                var l2_2 = new Lifeevent()
                {
                    CelebrityId = c2.Id,
                    Date = new DateTime(1989, 6, 8),
                    Description = "В CERN предложил \"Гиппертекстовый проект\"",
                    ReqPhotoPath = null
                };
                context.Lifeevents.Add(l2_1);
                context.Lifeevents.Add(l2_2);

                var c3 = new Celebrity() { FullName = "Edgar Codd", Nationality = "US", ReqPhotoPath = puri("Codd.jpg") };
                context.Celebrities.Add(c3);
                context.SaveChanges();
                var l3_1 = new Lifeevent() { CelebrityId = c3.Id, Date = new DateTime(1923, 8, 23), Description = "Дата рождения", ReqPhotoPath = null };
                var l3_2 = new Lifeevent() { CelebrityId = c3.Id, Date = new DateTime(2003, 4, 18), Description = "Дата смерти", ReqPhotoPath = null };
                context.Lifeevents.Add(l3_1);
                context.Lifeevents.Add(l3_2);

                var c4 = new Celebrity() { FullName = "Donald Knuth", Nationality = "US", ReqPhotoPath = puri("Knuth.jpg") };
                context.Celebrities.Add(c4);
                context.SaveChanges();
                var l4_1 = new Lifeevent() { CelebrityId = c4.Id, Date = new DateTime(1938, 1, 10), Description = "Дата рождения", ReqPhotoPath = null };
                var l4_2 = new Lifeevent() { CelebrityId = c4.Id, Date = new DateTime(1974, 1, 1), Description = "Премия Тьюринга", ReqPhotoPath = null };
                context.Lifeevents.Add(l4_1);
                context.Lifeevents.Add(l4_2);

                var c5 = new Celebrity() { FullName = "Linus Torvalds", Nationality = "US", ReqPhotoPath = puri("Linus.jpg") };
                context.Celebrities.Add(c5);
                context.SaveChanges();
                var l5_1 = new Lifeevent()
                {
                    CelebrityId = c5.Id,
                    Date = new DateTime(1969, 12, 28),
                    Description = "Дата рождения. Финляндия.",
                    ReqPhotoPath = null
                };
                var l5_2 = new Lifeevent()
                {
                    CelebrityId = c5.Id,
                    Date = new DateTime(1991, 9, 17),
                    Description = "Выложил исходный код OS Linus (версии 0.01)",
                    ReqPhotoPath = null
                };
                context.Lifeevents.Add(l5_1);
                context.Lifeevents.Add(l5_2);

                var c6 = new Celebrity() { FullName = "John Neumann", Nationality = "US", ReqPhotoPath = puri("Neumann.jpg") };
                context.Celebrities.Add(c6);
                context.SaveChanges();
                var l6_1 = new Lifeevent()
                {
                    CelebrityId = c6.Id,
                    Date = new DateTime(1903, 12, 28),
                    Description = "Дата рождения. Венгрия",
                    ReqPhotoPath = null
                };
                var l6_2 = new Lifeevent() { CelebrityId = c6.Id, Date = new DateTime(1957, 2, 8), Description = "Дата смерти", ReqPhotoPath = null };
                context.Lifeevents.Add(l6_1);
                context.Lifeevents.Add(l6_2);

                var c7 = new Celebrity() { FullName = "Edsger Dijkstra", Nationality = "NL", ReqPhotoPath = puri("Dijkstra.jpg") };
                context.Celebrities.Add(c7);
                context.SaveChanges();
                var l7_1 = new Lifeevent() { CelebrityId = c7.Id, Date = new DateTime(1930, 12, 28), Description = "Дата рождения", ReqPhotoPath = null };
                var l7_2 = new Lifeevent() { CelebrityId = c7.Id, Date = new DateTime(2002, 8, 6), Description = "Дата смерти", ReqPhotoPath = null };
                context.Lifeevents.Add(l7_1);
                context.Lifeevents.Add(l7_2);

                var c8 = new Celebrity() { FullName = "Ada Lovelace", Nationality = "UK", ReqPhotoPath = puri("Lovelace.jpg") };
                context.Celebrities.Add(c8);
                context.SaveChanges();
                var l8_1 = new Lifeevent() { CelebrityId = c8.Id, Date = new DateTime(1815, 12, 10), Description = "Дата рождения", ReqPhotoPath = null };
                var l8_2 = new Lifeevent() { CelebrityId = c8.Id, Date = new DateTime(1852, 11, 27), Description = "Дата смерти", ReqPhotoPath = null };
                context.Lifeevents.Add(l8_1);
                context.Lifeevents.Add(l8_2);

                var c9 = new Celebrity() { FullName = "Charles Babbage", Nationality = "UK", ReqPhotoPath = puri("Babbage.jpg") };
                context.Celebrities.Add(c9);
                context.SaveChanges();
                var l9_1 = new Lifeevent() { CelebrityId = c9.Id, Date = new DateTime(1791, 12, 26), Description = "Дата рождения", ReqPhotoPath = null };
                var l9_2 = new Lifeevent() { CelebrityId = c9.Id, Date = new DateTime(1871, 10, 18), Description = "Дата смерти", ReqPhotoPath = null };
                context.Lifeevents.Add(l9_1);
                context.Lifeevents.Add(l9_2);

                var c10 = new Celebrity() { FullName = "Andrew Tanenbaum", Nationality = "NL", ReqPhotoPath = puri("Tanenbaum.jpg") };
                context.Celebrities.Add(c10);
                context.SaveChanges();
                var l10_1 = new Lifeevent() { CelebrityId = c10.Id, Date = new DateTime(1944, 3, 16), Description = "Дата рождения", ReqPhotoPath = null };
                var l10_2 = new Lifeevent()
                {
                    CelebrityId = c10.Id,
                    Date = new DateTime(1987, 1, 1),
                    Description = "Cоздал OS MINIX — бесплатную Unix-подобную систему",
                    ReqPhotoPath = null
                };
                context.Lifeevents.Add(l10_1);
                context.Lifeevents.Add(l10_2);

                context.SaveChanges();
            }
        }
    }
}