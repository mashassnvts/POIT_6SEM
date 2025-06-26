using DAL_Celebrity;
using DAL_Celebrity_MSSQL;
using Microsoft.EntityFrameworkCore;

namespace DAL_Celebrity_MSSQL_Test
{
    internal class Program
    {
        private static void Main(string[] args)
        {
            string CS = @"Data Source=MASHA;Initial Catalog=MSSQLLocalDB;Integrated Security=True;TrustServerCertificate=True;";

            Init init = new Init(CS);
            Init.Execute(delete: true, create: true);

            Func<Celebrity, string> printC = (c) => $"Id = {c.Id}, FullName = {c.FullName}, Nationality = {c.Nationality}, ReqPhotoPath = {c.ReqPhotoPath}";
            Func<Lifeevent, string> printL = (l) => $"Id = {l.Id}, CelebrityId = {l.CelebrityId}, Date = {l.Date}, Description = {l.Description}, ReqPhotoPath = {l.ReqPhotoPath}";
            Func<string, string> puri = (string f) => $"{f}";

            using (IRepository<Celebrity, Lifeevent> repo = CelebrityRepository.Create(CS))
            {
                {
                    Console.WriteLine("------ GetAllCelebrities() ------------- ");
                    repo.GetAllCelebrities().ForEach(celebrity => Console.WriteLine(printC(celebrity)));
                }
                {
                    Console.WriteLine("------ GetAllLifeevents() ------------- ");
                    repo.GetAllLifeevents().ForEach(life => Console.WriteLine(printL(life)));
                }
                {
                    Console.WriteLine("------ AddCelebrity() --------------- ");
                    Celebrity c = new Celebrity { FullName = "Albert Einstein", Nationality = "DE", ReqPhotoPath = puri("Einstein.jpg") };
                    if (repo.AddCelebrity(c)) Console.WriteLine($"OK: AddCelebrity: {printC(c)}");
                    else Console.WriteLine($"ERROR:AddCelebrity: {printC(c)}");
                }
                {
                    Console.WriteLine("------ AddCelebrity() --------------- ");
                    Celebrity c = new Celebrity { FullName = "Samuel Huntington", Nationality = "US", ReqPhotoPath = puri("Huntington.jpg") };
                    if (repo.AddCelebrity(c)) Console.WriteLine($"OK: AddCelebrity: {printC(c)}");
                    else Console.WriteLine($"ERROR:AddCelebrity: {printC(c)}");
                }
                {
                    Console.WriteLine("------ DelCelebrity() --------------- ");
                    int id = 0;
                    if ((id = repo.GetCelebrityIdByName("Albert Einstein")) > 0)
                    {
                        Celebrity? c = repo.GetCelebrityById(id);
                        if (c != null)
                        {
                            Console.WriteLine(printC(c));
                            if (!repo.DelCelebrity(id)) Console.WriteLine($"ERROR: DelCelebrity: {id}");
                            else Console.WriteLine($"OK: DelCelebrity: {id}");
                        }
                        else Console.WriteLine($"ERROR: GetCelebrityById: {id}");
                    }
                    else Console.WriteLine($"ERROR: GetCelebrityIdByName");
                }
                {
                    Console.WriteLine("------ UpdCelebrity() --------------- ");
                    int id = 0;
                    if ((id = repo.GetCelebrityIdByName("Samuel Huntington")) > 0)
                    {
                        Celebrity? c = repo.GetCelebrityById(id);
                        if (c != null)
                        {
                            Console.WriteLine(printC(c));
                            c.FullName = "Samuel Phillips Huntington";
                            if (!repo.UpdCelebrity(id, c)) Console.WriteLine($"ERROR: UpdCelebrity: {id}");
                            else
                            {
                                Console.WriteLine($"OK: UpdCelebrity:{id}, {printC(c)}");
                                Celebrity? c1 = repo.GetCelebrityById(id);
                                if (c1 == null) Console.WriteLine($"ERROR: GetCelebrityById {id}");
                                else Console.WriteLine($"OK: GetCelebrityById, {printC(c1)}");
                            }
                        }
                        else Console.WriteLine($"ERROR: GetCelebrityById: {id}");
                    }
                    else Console.WriteLine($"ERROR: GetCelebrityIdByName");
                }
                {
                    Console.WriteLine("------ AddLifeevent() --------------- ");
                    int id = 0;
                    if ((id = repo.GetCelebrityIdByName("Samuel Phillips Huntington")) > 0)
                    {
                        Celebrity? c = repo.GetCelebrityById(id);
                        if (c != null)
                        {
                            Console.WriteLine(printC(c));
                            Lifeevent l1 = new Lifeevent { CelebrityId = id, Date = new DateTime(1927, 4, 18), Description = "Дата рождения" };
                            Lifeevent l2 = new Lifeevent { CelebrityId = id, Date = new DateTime(2008, 12, 24), Description = "Дата смерти" };
                            if (repo.AddLifeevent(l1))
                                Console.WriteLine($"OK: AddLifeevent, {printL(l1)}");
                            else Console.WriteLine($"ERROR: AddLifeevent, {printL(l1)}");
                            if (repo.AddLifeevent(l2))
                                Console.WriteLine($"OK: AddLifeevent, {printL(l2)}");
                            else Console.WriteLine($"ERROR: AddLifeevent, {printL(l2)}");
                        }
                        else Console.WriteLine($"ERROR: GetCelebrityById: {id}");
                    }
                    else Console.WriteLine($"ERROR: GetCelebrityIdByName");
                }
                {
                    Console.WriteLine("------ DelLifeevent() --------------- ");
                    int id = repo.GetAllLifeevents().LastOrDefault()?.Id ?? -1;
                    if (id > 0 && repo.DelLifeevent(id))
                        Console.WriteLine($"OK: DelLifeevent: {id}");
                    else Console.WriteLine($"ERROR: DelLifeevent: {id}");
                }
                {
                    Console.WriteLine("------ UpdLifeevent() --------------- ");
                    int id = repo.GetAllLifeevents().LastOrDefault()?.Id ?? -1;
                    Lifeevent? l1;
                    if (id > 0 && (l1 = repo.GetLifeevetById(id)) != null)
                    {
                        l1.Description = "Дата смерти";
                        if (repo.UpdLifeevent(id, l1))
                            Console.WriteLine($"OK:UpdLifeevent {id}, {printL(l1)}");
                        else Console.WriteLine($"ERROR:UpdLifeevent {id}, {printL(l1)}");
                    }
                    else Console.WriteLine($"ERROR: GetLifeevetById: {id}");
                }
                {
                    Console.WriteLine("------ GetLifeeventsByCelebrityId ------------- ");
                    int id = 0;
                    if ((id = repo.GetCelebrityIdByName("Samuel Phillips Huntington")) > 0)
                    {
                        Celebrity? c = repo.GetCelebrityById(id);
                        if (c != null)
                            repo.GetLifeeventsByCelebrityId(c.Id).ForEach(l => Console.WriteLine($"OK: GetLifeeventsByCelebrityId, {id}, {printL(l)}"));
                        else Console.WriteLine($"ERROR: GetLifeeventsByCelebrityId: {id}");
                    }
                    else Console.WriteLine($"ERROR: GetCelebrityIdByName");
                }
                {
                    Console.WriteLine("------ GetCelebrityByLifeeventId ------------- ");
                    int id = repo.GetAllLifeevents().LastOrDefault()?.Id ?? -1;
                    Celebrity? c;
                    if (id > 0 && (c = repo.GetCelebrityByLifeeventId(id)) != null)
                        Console.WriteLine($"OK:{printC(c)}");
                    else Console.WriteLine($"ERROR: GetCelebrityByLifeeventId, {id}");
                }
            }
            Console.WriteLine("------------>");
            Console.ReadKey();
        }
    }
}