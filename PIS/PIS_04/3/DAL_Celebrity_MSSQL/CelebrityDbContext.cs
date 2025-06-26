using Microsoft.EntityFrameworkCore;
using DAL_Celebrity;
using System;

namespace DAL_Celebrity_EF
{
    public class CelebrityDbContext : DbContext
    {
        public DbSet<Celebrity> Celebrities { get; set; }
        public DbSet<Lifeevent> Lifeevents { get; set; }

        public CelebrityDbContext(DbContextOptions<CelebrityDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Конфигурация модели Celebrity
            modelBuilder.Entity<Celebrity>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.FullName).IsRequired();
                entity.Property(e => e.Nationality).IsRequired().HasMaxLength(2);
                entity.Property(e => e.ReqPhotoPath);
            });

            // Конфигурация модели Lifeevent
            modelBuilder.Entity<Lifeevent>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Description).IsRequired();
                entity.Property(e => e.Date);
                entity.Property(e => e.ReqPhotoPath);

                // Связь с Celebrity
                entity.HasOne<Celebrity>()
                    .WithMany()
                    .HasForeignKey(e => e.CelebrityId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}