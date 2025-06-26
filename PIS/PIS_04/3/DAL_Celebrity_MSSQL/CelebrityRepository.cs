using DAL_Celebrity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace DAL_Celebrity_EF
{
    public class CelebrityRepository : IRepository<Celebrity, Lifeevent>
    {
        private readonly CelebrityDbContext _context;
        private bool _disposed = false;

        public CelebrityRepository(Credentials credentials)
        {
            var optionsBuilder = new DbContextOptionsBuilder<CelebrityDbContext>();
            optionsBuilder.UseSqlServer(credentials.ConnectionString);
            _context = new CelebrityDbContext(optionsBuilder.Options);
        }

        #region ICelebrity<Celebrity> implementation

        public List<Celebrity> GetAllCelebrities()
        {
            return _context.Celebrities.ToList();
        }

        public Celebrity? GetCelebrityById(int Id)
        {
            return _context.Celebrities.Find(Id);
        }

        public bool DelCelebrity(int id)
        {
            var celebrity = _context.Celebrities.Find(id);
            if (celebrity == null) return false;

            _context.Celebrities.Remove(celebrity);
            return _context.SaveChanges() > 0;
        }

        public bool AddCelebrity(Celebrity celebrity)
        {
            _context.Celebrities.Add(celebrity);
            return _context.SaveChanges() > 0;
        }

        public bool UpdCelebrity(int id, Celebrity celebrity)
        {
            var existing = _context.Celebrities.Find(id);
            if (existing == null) return false;

            existing.Update(celebrity);
            _context.Entry(existing).State = EntityState.Modified;
            return _context.SaveChanges() > 0;
        }

        public int GetCelebrityIdByName(string name)
        {
            var celebrity = _context.Celebrities
                .FirstOrDefault(c => c.FullName.Contains(name));

            return celebrity?.Id ?? 0;
        }

        #endregion

        #region ILifeevent<Lifeevent> implementation

        public List<Lifeevent> GetAllLifeevents()
        {
            return _context.Lifeevents.ToList();
        }

        public Lifeevent? GetLifeevetById(int Id)
        {
            return _context.Lifeevents.Find(Id);
        }

        public bool DelLifeevent(int id)
        {
            var lifeevent = _context.Lifeevents.Find(id);
            if (lifeevent == null) return false;

            _context.Lifeevents.Remove(lifeevent);
            return _context.SaveChanges() > 0;
        }

        public bool AddLifeevent(Lifeevent lifeevent)
        {
            _context.Lifeevents.Add(lifeevent);
            return _context.SaveChanges() > 0;
        }

        public bool UpdLifeevent(int id, Lifeevent lifeevent)
        {
            var existing = _context.Lifeevents.Find(id);
            if (existing == null) return false;

            existing.Update(lifeevent);
            _context.Entry(existing).State = EntityState.Modified;
            return _context.SaveChanges() > 0;
        }

        #endregion

        #region IMix<Celebrity, Lifeevent> implementation

        public List<Lifeevent> GetLifeeventsByCelebrityId(int celebrityId)
        {
            return _context.Lifeevents
                .Where(e => e.CelebrityId == celebrityId)
                .ToList();
        }

        public Celebrity? GetCelebrityByLifeeventId(int lifeeventId)
        {
            var celebrityId = _context.Lifeevents.FirstOrDefault(e => e.Id == lifeeventId)?.CelebrityId;

            return celebrityId != null ? _context.Celebrities.FirstOrDefault(e => e.Id == celebrityId) : null;
        }

        #endregion

        #region IDisposable implementation

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    _context.Dispose();
                }
                _disposed = true;
            }
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        #endregion
    }
}