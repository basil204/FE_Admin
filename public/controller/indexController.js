app.controller("indexController", [
    "$scope",
    "$http",
    function ($scope, $http) {
        const token = localStorage.getItem("authToken");
        $scope.showWarning = true;

        // Thời gian để ẩn cảnh báo tự động sau 5 giây
        setTimeout(function () {
            $scope.$apply(function () {
                $scope.showWarning = false;
            });
        }, 5000);

        // Hàm để đóng cảnh báo khi người dùng nhấn vào nút "Đóng"
        $scope.closeWarning = function () {
            $scope.showWarning = false;
        };

        // Set up the headers with the token
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        // Fetch top 5 users with authorization token
        $http
            .get("http://160.30.21.47:1234/api/user/findTop5", config)
            .then(function (response) {
                $scope.customers = response.data;
            })
            .catch(function (error) {
                console.error("Error fetching top 5 users:", error);
            });

        // Fetch the count of Milkdetail items with low stock with authorization token
        $http
            .get("http://160.30.21.47:1234/api/Milkdetail/low-stock-count", config)
            .then(function (response) {
                $scope.countend = response.data;
            })
            .catch(function (error) {
                console.error("Error fetching low stock count:", error);
            });

        $http
            .get("http://160.30.21.47:1234/api/Milkdetail/count-milkdetail", config)
            .then(function (response) {
                $scope.countmilkdetail = response.data;
            })
            .catch(function (error) {
                console.error("Error fetching milkdetail count:", error);
            });

        $http
            .get("http://160.30.21.47:1234/api/Invoice/count/current", config)
            .then(function (response) {
                $scope.countinvoice = response.data;
            })
            .catch(function (error) {
                console.error("Error fetching invoice count:", error);
            });

        $http
            .get("http://160.30.21.47:1234/api/user/count", config)
            .then(function (response) {
                $scope.countuser = response.data;
            })
            .catch(function (error) {
                console.error("Error fetching user count:", error);
            });

        // Fetch user invoices and their status
        $http
            .get("http://160.30.21.47:1234/api/Userinvoice/user-invoices", config)
            .then(function (response) {
                $scope.orders = response.data;  // Lưu dữ liệu đơn hàng vào $scope.orders
            })
            .catch(function (error) {
                console.error("Error fetching user invoices:", error);
            });

        // Fetch milk sales details
        $http
            .get("http://160.30.21.47:1234/api/Invoicedetail/milk-sales-details", config)
            .then(function (response) {
                $scope.milkSalesDetails = response.data;
            })
            .catch(function (error) {
                console.error("Error fetching milk sales details:", error);
            });

        // Fetch the invoice summary
        $http
            .get("http://160.30.21.47:1234/api/Invoicedetail/invoice-summary", config)
            .then(function (response) {
                $scope.invoiceSummary = response.data;
            })
            .catch(function (error) {
                console.error("Error fetching invoice summary:", error);
            });
    }
]);
