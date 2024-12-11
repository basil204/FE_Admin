app.controller('DonHangController', function ($scope, $http, socket) {

    const token = localStorage.getItem("authToken");
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    $scope.invoices = []
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-right',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });
    console.log($scope.invoices)
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    $scope.statusMap = {
        0: "Không hoạt động",
        1: "Hoạt động",
        336: "Huỷ Đơn",
        913: "Hoàn thành",
        901: "Chờ lấy hàng",
        903: "Đã lấy hàng",
        904: "Giao hàng",
        301: "Chờ Duyệt Đơn",
        337: "Chưa Thanh Toán",
        338: "Đơn Chờ",
        305: "Thanh toán thành công"
    };
    // Hàm lấy trạng thái từ mã trạng thái
    $scope.getStatus = function (statusCode) {
        return $scope.statusMap[statusCode] || "Không xác định";
    };
    if (!socket.isConnected) {
        socket.connect().then(function () {
            socket.subscribe(`/user/${userInfo.sub}/queue/messages`, function (message) {
                console.log(message);
                $scope.loadInvoice(message)

            });
            socket.subscribe("/topic/messages", function (message) {
                Toast.fire({
                    icon: 'info',
                    title: `Hóa đơn #${message} đã được đặt!`
                });
            })
        });
    }
    $scope.invoiceOk = function (invoiceID) {
        Swal.fire({
            title: "Bạn có chắc muốn duyệt hóa đơn này?", // Question text
            text: "Hành động này không thể hoàn tác!", // Optional extra text
            icon: "question", // Icon type (question icon)
            showCancelButton: true, // Show cancel button
            confirmButtonText: "Duyệt", // Text for the confirm button
            cancelButtonText: "Hủy", // Text for the cancel button
            reverseButtons: true, // Optional: makes the cancel button appear on the left
        }).then((result) => {
            if (result.isConfirmed) {
                const url = `http://160.30.21.47:1234/api/Invoice/waiting/${invoiceID}`;

                // Use Angular's $http for better integration
                $http
                    .put(url, {}, config)
                    .then((response) => {
                        if (response.data.success) {
                            socket.sendMessage('/app/cod', "a")
                            $scope.showNotification("Duyệt hóa đơn thành công!", "success");
                        } else {
                            $scope.showNotification(
                                "Có lỗi xảy ra khi duyệt hóa đơn.",
                                "error"
                            );
                        }
                    })
                    .catch((error) => {
                        $scope.showNotification("Lỗi kết nối hoặc lỗi server.", "error");
                        console.error("Error:", error);
                    });
            } else {
                console.log("Hủy duyệt hóa đơn.");
            }
        });
    };

    // Function to show notifications using Swal
    $scope.showNotification = function (message, type) {
        Swal.fire({
            title: type === "success" ? "Thành công!" : "Lỗi!",
            text: message,
            icon: type,
            confirmButtonText: "OK",
            timer: 3000,
            timerProgressBar: true,
        });
    }
    $scope.loadInvoice = function (invoice) {
        $scope.invoices = invoice
        $scope.$apply();
    }
});