using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL_Celebrity
{
    public class Lifeevent  //  Событие в  жизни знаменитости 
    {
        public Lifeevent() { this.Description = string.Empty; }
        public int Id { get; set; }           // Id События  
        public int CelebrityId { get; set; }           // Id Знаменитости
        public DateTime? Date { get; set; }           // дата События 
        public string Description { get; set; }           // описание События 
        public string? ReqPhotoPath { get; set; }           // reguest path  Фотографии
        public virtual bool Update(Lifeevent lifeevent)       // -- вспомогательный метод                                           
        {
            if (!(lifeevent.CelebrityId <= 0)) this.CelebrityId = lifeevent.CelebrityId;
            if (!lifeevent.Date.Equals(new DateTime())) this.Date = lifeevent.Date;
            if (!string.IsNullOrEmpty(lifeevent.Description)) this.Description = lifeevent.Description;
            if (!string.IsNullOrEmpty(lifeevent.ReqPhotoPath)) this.ReqPhotoPath = lifeevent.ReqPhotoPath;
            return true;     //  изменения были ?
        }
    }
}
