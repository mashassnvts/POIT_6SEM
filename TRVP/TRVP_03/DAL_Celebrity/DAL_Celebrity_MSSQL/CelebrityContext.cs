using DAL_Celebrity;
using Microsoft.EntityFrameworkCore;

namespace DAL_Celebrity_MSSQL
{
    public class CelebrityContext : DbContext
    {
        public string? ConnectionString { get; private set; } = null;

        public CelebrityContext(string connString) : base()
        {
            this.ConnectionString = connString;
            //this.Database.EnsureDeleted();
            //this.Database.EnsureCreated();
        }

        public CelebrityContext() : base()
        {
            //this.Database.EnsureDeleted();
            //this.Database.EnsureCreated();
        }

        public DbSet<Celebrity> Celebrities { get; set; }
        public DbSet<Lifeevent> Lifeevents { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (this.ConnectionString is null)
                this.ConnectionString = @"Data Source=MASHA;Initial Catalog=MSSQLLocalDB;Integrated Security=True;TrustServerCertificate=True;";

            optionsBuilder.UseSqlServer(this.ConnectionString, sqlServerOptions =>
            {
                sqlServerOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorNumbersToAdd: null);
            });
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Celebrity>().ToTable("Celebrities").HasKey(p => p.Id);
            modelBuilder.Entity<Celebrity>().Property(p => p.Id).IsRequired();
            modelBuilder.Entity<Celebrity>().Property(p => p.FullName).IsRequired().HasMaxLength(50);
            modelBuilder.Entity<Celebrity>().Property(p => p.Nationality).IsRequired().HasMaxLength(20);
            modelBuilder.Entity<Celebrity>().Property(p => p.ReqPhotoPath).HasMaxLength(200);

            modelBuilder.Entity<Lifeevent>().ToTable("Lifeevents").HasKey(p => p.Id);
            modelBuilder.Entity<Lifeevent>().Property(p => p.Id).IsRequired();
            modelBuilder.Entity<Lifeevent>()
                .HasOne(le => le.Celebrity)
                .WithMany(c => c.Lifeevents)
                .HasForeignKey(p => p.CelebrityId)
                .OnDelete(DeleteBehavior.Restrict); 
            modelBuilder.Entity<Lifeevent>().Property(p => p.CelebrityId).IsRequired();
            modelBuilder.Entity<Lifeevent>().Property(p => p.Date);
            modelBuilder.Entity<Lifeevent>().Property(p => p.Description).HasMaxLength(256);
            modelBuilder.Entity<Lifeevent>().Property(p => p.ReqPhotoPath).HasMaxLength(256);

            base.OnModelCreating(modelBuilder);
        }
    }
}