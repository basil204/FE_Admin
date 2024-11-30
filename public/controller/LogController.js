app.controller("LogController", [
    "$scope",
    "$http",
    function ($scope, $http, socket) {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (userInfo) {
            socket.connect(userInfo);
        }
        const token = localStorage.getItem("authToken"); // Lấy token từ localStorage
        const API_BASE_URL = "http://160.30.21.47:1234/api/Log"; // Đường dẫn API backend

        // Khởi tạo biến
        $scope.logs = []; // Danh sách logs
        $scope.searchUsername = ""; // Username cần tìm
        $scope.currentPage = 0; // Trang hiện tại
        $scope.pageSize = 10; // Số lượng bản ghi trên mỗi trang
        $scope.totalPages = 0; // Tổng số trang
        $scope.isSearching = false; // Trạng thái tìm kiếm

        // Hàm lấy toàn bộ logs (mặc định hiển thị danh sách ban đầu)
        $scope.getAllLogs = function () {
            const params = {
                page: $scope.currentPage,
                size: $scope.pageSize,
            };

            $http({
                method: "GET",
                url: `${API_BASE_URL}/lst`,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: params,
            }).then(
                function (response) {
                    $scope.logs = response.data.content; // Lấy danh sách logs từ response

                    // Format thời gian với múi giờ '+0700'


                    $scope.totalPages = response.data.page.totalPages; // Tổng số trang
                    $scope.isSearching = false; // Đặt lại trạng thái tìm kiếm
                },
                function (error) {
                    console.error("Không thể tải danh sách logs", error);
                }
            );
        };


        // Hàm tìm kiếm logs theo username
        $scope.searchLogs = function () {
            if (!$scope.searchUsername) {
                alert("Vui lòng nhập username để tìm kiếm!");
                return;
            }

            const params = {
                username: $scope.searchUsername,
                page: $scope.currentPage,
                size: $scope.pageSize,
            };

            $http({
                method: "GET",
                url: `${API_BASE_URL}/search`,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: params,
            }).then(
                function (response) {
                    $scope.logs = response.data.content; // Lấy danh sách logs từ response
                    $scope.totalPages = response.data.page.totalPages; // Tổng số trang
                    $scope.isSearching = true; // Đặt trạng thái đang tìm kiếm
                },
                function (error) {
                    console.error("Không thể tìm logs theo username", error);
                }
            );
        };

        // Hàm thay đổi trang
        $scope.changePage = function (page) {
            if (page >= 0 && page < $scope.totalPages) {
                $scope.currentPage = page;
                if ($scope.isSearching) {
                    $scope.searchLogs(); // Nếu đang tìm kiếm, gọi lại searchLogs
                } else {
                    $scope.getAllLogs(); // Nếu không, gọi lại getAllLogs
                }
            }
        };

        // Gọi API lấy toàn bộ logs khi khởi tạo
        $scope.getAllLogs();
    },
]);
