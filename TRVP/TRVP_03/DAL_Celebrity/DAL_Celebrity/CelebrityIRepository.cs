﻿using DAL_Celebrity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL_Celebrity
{
    public interface IRepository : IRepository<Celebrity, Lifeevent> { }

    public class Celebrity  
    {
        public Celebrity() { this.FullName = string.Empty; this.Nationality = string.Empty; this.Lifeevents = new List<Lifeevent>(); }
        public int Id { get; set; }                        
        public string FullName { get; set; }         
        public string Nationality { get; set; }         
        public string? ReqPhotoPath { get; set; }         
        public virtual List<Lifeevent> Lifeevents { get; set; } 
        public virtual bool Update(Celebrity celebrity)   
        {
            if (!string.IsNullOrEmpty(celebrity.FullName)) this.FullName = celebrity.FullName;
            if (!string.IsNullOrEmpty(celebrity.Nationality)) this.Nationality = celebrity.Nationality;
            if (!string.IsNullOrEmpty(celebrity.ReqPhotoPath)) this.ReqPhotoPath = celebrity.ReqPhotoPath;
            return true;     
        }
    }

    public class Lifeevent  
    {
        public Lifeevent() { this.Description = string.Empty; }
        public int Id { get; set; }           
        public int CelebrityId { get; set; }           
        public DateTime? Date { get; set; }           
        public string Description { get; set; }           
        public string? ReqPhotoPath { get; set; }           
        public virtual Celebrity Celebrity { get; set; } 
        public virtual bool Update(Lifeevent lifeevent)                                               
        {
            if (!(lifeevent.CelebrityId <= 0)) this.CelebrityId = lifeevent.CelebrityId;
            if (!lifeevent.Date.Equals(new DateTime())) this.Date = lifeevent.Date;
            if (!string.IsNullOrEmpty(lifeevent.Description)) this.Description = lifeevent.Description;
            if (!string.IsNullOrEmpty(lifeevent.ReqPhotoPath)) this.ReqPhotoPath = lifeevent.ReqPhotoPath;
            return true;     
        }
    }
}
