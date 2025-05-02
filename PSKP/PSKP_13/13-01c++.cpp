//client
#include <iostream>
#include <cstring>
#include <winsock2.h>
#include <ws2tcpip.h>
#pragma comment(lib, "ws2_32.lib")  // Линковка библиотеки ws2_32

#define PORT 4000
#define MAX_BUFFER_SIZE 1024

int main() {
    WSADATA wsaData;
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
        std::cerr << "WSAStartup failed" << std::endl;
        return -1;
    }

    int sock;
    struct sockaddr_in server_address;
    char buffer[MAX_BUFFER_SIZE] = {0};
    std::string message = "Hello from 13-02 client!";

    // Создание TCP-сокета
    if ((sock = socket(AF_INET, SOCK_STREAM, 0)) == INVALID_SOCKET) {
        std::cerr << "Socket failed" << std::endl;
        return -1;
    }

    server_address.sin_family = AF_INET;
    server_address.sin_port = htons(PORT);
    server_address.sin_addr.s_addr = inet_addr("127.0.0.1");

    // Подключение к серверу
    if (connect(sock, (struct sockaddr*)&server_address, sizeof(server_address)) == SOCKET_ERROR) {
        std::cerr << "Connect failed" << std::endl;
        return -1;
    }

    std::cout << "Connected to server" << std::endl;

    // Отправка сообщения на сервер
    send(sock, message.c_str(), message.length(), 0);
    std::cout << "Message sent to server: " << message << std::endl;

    // Получение ответа от сервера
    int valread = recv(sock, buffer, MAX_BUFFER_SIZE, 0);
    if (valread == SOCKET_ERROR) {
        std::cerr << "Recv failed" << std::endl;
        return -1;
    }
    std::cout << "Client received: " << buffer << std::endl;

    // Закрытие соединения
    closesocket(sock);
    WSACleanup();
    std::cout << "Connection closed" << std::endl;

    return 0;
}
