//server
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

    int server_fd, new_socket;
    struct sockaddr_in address;
    char buffer[MAX_BUFFER_SIZE] = {0};
    std::string message_prefix = "ECHO: ";

    // Создание TCP-сокета
    if ((server_fd = socket(AF_INET, SOCK_STREAM, 0)) == INVALID_SOCKET) {
        std::cerr << "Socket failed" << std::endl;
        return -1;
    }

    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(PORT);

    // Привязка сокета к порту
    if (bind(server_fd, (struct sockaddr*)&address, sizeof(address)) == SOCKET_ERROR) {
        std::cerr << "Bind failed" << std::endl;
        return -1;
    }

    // Прослушивание порта
    if (listen(server_fd, 3) == SOCKET_ERROR) {
        std::cerr << "Listen failed" << std::endl;
        return -1;
    }

    std::cout << "Server listening on port " << PORT << "..." << std::endl;

    // Принятие соединений
    int addr_len = sizeof(address);
    if ((new_socket = accept(server_fd, (struct sockaddr*)&address, (socklen_t*)&addr_len)) == INVALID_SOCKET) {
        std::cerr << "Accept failed" << std::endl;
        return -1;
    }

    std::cout << "Connection accepted" << std::endl;

    // Чтение данных от клиента
    int valread = recv(new_socket, buffer, MAX_BUFFER_SIZE, 0);
    if (valread == SOCKET_ERROR) {
        std::cerr << "Recv failed" << std::endl;
        return -1;
    }
    std::cout << "Server received: " << buffer << std::endl;

    // Отправка ответа клиенту
    std::string response = message_prefix + buffer;
    send(new_socket, response.c_str(), response.length(), 0);
    std::cout << "Sent to client: " << response << std::endl;

    // Закрытие соединения
    closesocket(new_socket);
    closesocket(server_fd);
    WSACleanup();
    std::cout << "Connection closed" << std::endl;

    return 0;
}
