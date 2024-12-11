app.controller('DonHangController', function ($scope, $http, socket) {

    const token = localStorage.getItem("authToken");
    const urlInvoice = "http://160.30.21.47:1234/api/Invoice/"
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
            'Accept': 'application/json',
            'Content-Type': 'application/json',
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
        $http
            .put(urlInvoice + "waiting/" + invoiceID, config)
            .then((response) => {
                console.log(response.data)
                $scope.invoices = JSON.parse(localStorage.getItem('invoice'))
            })
            .catch((error) => {
                console.error(error.data)
            });
    }
    $scope.loadInvoice = function (invoice) {
        $scope.invoices = invoice
        $scope.$apply();
    }
});