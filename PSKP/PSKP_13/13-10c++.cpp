//client
#include <iostream>
#include <winsock2.h>

#pragma comment(lib, "ws2_32.lib") // Подключаем библиотеку Winsock

#define SERVER_IP "127.0.0.1"
#define PORT 4000
#define BUFFER_SIZE 1024

int main(int argc, char* argv[]) {
    WSADATA wsaData;
    SOCKET clientSocket;
    sockaddr_in serverAddr;
    char buffer[BUFFER_SIZE];

    // Проверяем аргумент командной строки
    std::string message = (argc > 1) ? argv[1] : "Client message";

    // Инициализация Winsock
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
        std::cerr << "WSAStartup failed\n";
        return 1;
    }

    // Создание UDP-сокета
    clientSocket = socket(AF_INET, SOCK_DGRAM, 0);
    if (clientSocket == INVALID_SOCKET) {
        std::cerr << "Socket creation failed\n";
        WSACleanup();
        return 1;
    }

    // Настройка параметров сервера
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_port = htons(PORT);
    serverAddr.sin_addr.s_addr = inet_addr(SERVER_IP);

    // Отправка сообщения серверу
    sendto(clientSocket, message.c_str(), message.length(), 0,
           (struct sockaddr*)&serverAddr, sizeof(serverAddr));

    std::cout << "Message sent to server: " << message << std::endl;

    // Получение ответа от сервера
    int serverAddrSize = sizeof(serverAddr);
    int received = recvfrom(clientSocket, buffer, BUFFER_SIZE, 0,
                            (struct sockaddr*)&serverAddr, &serverAddrSize);
    if (received == SOCKET_ERROR) {
        std::cerr << "Receive failed\n";
    } else {
        buffer[received] = '\0';
        std::cout << "Received from server: " << buffer << std::endl;
    }

    closesocket(clientSocket);
    WSACleanup();
    return 0;
}
