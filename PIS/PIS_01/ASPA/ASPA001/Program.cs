internal class Program
{
    // ����� ����� � ����������
    private static void Main(string[] args)
    {
        // �������� � ��������� ���-���������� �� ������ ���������� ����������
        var builder = WebApplication.CreateBuilder(args);

        // ��������� �����������
        builder.Services.AddLogging(logging =>
        {
            logging.AddConsole(); // ����������� � �������
            logging.AddDebug();   // ����������� � ��������
        });

        // ���������� ���������� �� ������ ��������
        var app = builder.Build();

        // ����������� �������� ��� ��������� GET-������� �� �������� URL ("/")
        app.MapGet("/", () => "��� ������ ASPA");

        // ������ ����������
        app.Run();
    }
}