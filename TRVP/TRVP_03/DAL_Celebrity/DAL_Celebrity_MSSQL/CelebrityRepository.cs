using DAL_Celebrity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace DAL_Celebrity_MSSQL
{
    public class CelebrityRepository : IRepository<Celebrity, Lifeevent>
    {
        private CelebrityContext context;
        private bool disposed = false;

        public CelebrityRepository() { this.context = new CelebrityContext(); }
        public CelebrityRepository(string connectionstring) { this.context = new CelebrityContext(connectionstring); }
        public static IRepository<Celebrity, Lifeevent> Create() { return new CelebrityRepository(); }
        public static IRepository<Celebrity, Lifeevent> Create(string connectionstring) { return new CelebrityRepository(connectionstring); }

        public List<Celebrity> GetAllCelebrities() { return this.context.Celebrities.ToList<Celebrity>(); }
        public Celebrity? GetCelebrityById(int Id) { return this.context.Celebrities.Find(Id); }
        public bool AddCelebrity(Celebrity celebrity)
        {
            this.context.Celebrities.Add(celebrity);
            return this.context.SaveChanges() > 0;
        }
        public bool DelCelebrity(int id)
        {
            var celebrity = this.context.Celebrities.Find(id);
            if (celebrity == null) return false;

            var lifeevents = this.context.Lifeevents.Where(l => l.CelebrityId == id).ToList();
            if (lifeevents.Any())
            {
                this.context.Lifeevents.RemoveRange(lifeevents);
            }

            this.context.Celebrities.Remove(celebrity);
            return this.context.SaveChanges() > 0;
        }
        public bool UpdCelebrity(int id, Celebrity celebrity)
        {
            var oldCelebrity = this.context.Celebrities.Find(id);
            if (oldCelebrity == null) return false;
            oldCelebrity.Update(celebrity);
            return this.context.SaveChanges() > 0;
        }
        public List<Lifeevent> GetAllLifeevents() { return this.context.Lifeevents.ToList<Lifeevent>(); }
        public Lifeevent? GetLifeevetById(int Id) { return this.context.Lifeevents.Find(Id); }
        public bool AddLifeevent(Lifeevent lifeevent)
        {
            this.context.Lifeevents.Add(lifeevent);
            return this.context.SaveChanges() > 0;
        }
        public bool DelLifeevent(int id)
        {
            var lifeevent = this.context.Lifeevents.Find(id);
            if (lifeevent == null) return false;
            this.context.Lifeevents.Remove(lifeevent);
            return this.context.SaveChanges() > 0;
        }
        public bool UpdLifeevent(int id, Lifeevent lifeevent)
        {
            var oldLifeevent = this.context.Lifeevents.Find(id);
            if (oldLifeevent == null) return false;
            oldLifeevent.Update(lifeevent);
            return this.context.SaveChanges() > 0;
        }
        public List<Lifeevent> GetLifeeventsByCelebrityId(int celebrityId)
        {
            return this.context.Lifeevents.Where(x => x.CelebrityId == celebrityId).ToList();
        }
        public Celebrity? GetCelebrityByLifeeventId(int lifeeventId)
        {
            return this.context.Lifeevents
                .Include(x => x.Celebrity)
                .Where(x => x.Id == lifeeventId)
                .Select(x => x.Celebrity)
                .FirstOrDefault();
        }
        public int GetCelebrityIdByName(string name)
        {
            var celebrityId = this.context.Celebrities
                .Where(x => x.FullName == name)
                .Select(x => x.Id)
                .FirstOrDefault();
            return celebrityId != 0 ? celebrityId : -1;
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!disposed)
            {
                if (disposing)
                {
                    this.context.Dispose();
                }
                disposed = true;
            }
        }
    }
}