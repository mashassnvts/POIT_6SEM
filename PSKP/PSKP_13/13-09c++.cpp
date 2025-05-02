#include <iostream>
#include <winsock2.h>

#pragma comment(lib, "ws2_32.lib") // Подключаем библиотеку Winsock

#define PORT 4000
#define BUFFER_SIZE 1024

int main() {
    WSADATA wsaData;
    SOCKET serverSocket;
    sockaddr_in serverAddr, clientAddr;
    int clientAddrSize = sizeof(clientAddr);
    char buffer[BUFFER_SIZE];

    // Инициализация Winsock
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
        std::cerr << "WSAStartup failed\n";
        return 1;
    }

    // Создание UDP-сокета
    serverSocket = socket(AF_INET, SOCK_DGRAM, 0);
    if (serverSocket == INVALID_SOCKET) {
        std::cerr << "Socket creation failed\n";
        WSACleanup();
        return 1;
    }

    // Настройка параметров сервера
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_addr.s_addr = INADDR_ANY;
    serverAddr.sin_port = htons(PORT);

    // Привязка сокета
    if (bind(serverSocket, (struct sockaddr*)&serverAddr, sizeof(serverAddr)) == SOCKET_ERROR) {
        std::cerr << "Bind failed\n";
        closesocket(serverSocket);
        WSACleanup();
        return 1;
    }

    std::cout << "UDP Server listening on port " << PORT << std::endl;

    while (true) {
        // Получение данных от клиента
        int received = recvfrom(serverSocket, buffer, BUFFER_SIZE, 0,
                               (struct sockaddr*)&clientAddr, &clientAddrSize);
        if (received == SOCKET_ERROR) {
            std::cerr << "Receive failed\n";
            continue;
        }

        buffer[received] = '\0'; // Добавляем завершающий символ
        std::cout << "Received: " << buffer << std::endl;

        // Создание ответа
        std::string response = "ECHO: " + std::string(buffer);

        // Отправка ответа клиенту
        sendto(serverSocket, response.c_str(), response.length(), 0,
               (struct sockaddr*)&clientAddr, clientAddrSize);
    }

    closesocket(serverSocket);
    WSACleanup();
    return 0;
}
