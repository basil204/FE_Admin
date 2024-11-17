app.controller("indexController", [
    "$scope",
    "$http",
    "$location", // Inject $location to handle page redirection
    function ($scope, $http, $location) {
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

        // Function to handle 403 error and redirect to login
        function handleForbiddenError(error) {
            if (error.status === 403) {
                // Redirect to login page if status is 403
                $location.path('/login');
            } else {
                console.error("Error:", error);
            }
        }

        // Fetch top 5 users with authorization token
        $http
            .get("http://160.30.21.47:1234/api/user/findTop5", config)
            .then(function (response) {
                $scope.customers = response.data;
            })
            .catch(handleForbiddenError);

        // Fetch the count of Milkdetail items with low stock with authorization token
        $http
            .get("http://160.30.21.47:1234/api/Milkdetail/low-stock-count", config)
            .then(function (response) {
                $scope.countend = response.data;
            })
            .catch(handleForbiddenError);

        // Fetch the count of Milkdetail items
        $http
            .get("http://160.30.21.47:1234/api/Milkdetail/count-milkdetail", config)
            .then(function (response) {
                $scope.countmilkdetail = response.data;
            })
            .catch(handleForbiddenError);

        // Fetch the count of invoices
        $http
            .get("http://160.30.21.47:1234/api/Invoice/count/current", config)
            .then(function (response) {
                $scope.countinvoice = response.data;
            })
            .catch(handleForbiddenError);

        // Fetch the count of users
        $http
            .get("http://160.30.21.47:1234/api/user/count", config)
            .then(function (response) {
                $scope.countuser = response.data;
            })
            .catch(handleForbiddenError);

        // Fetch user invoices and their status
        $http
            .get("http://160.30.21.47:1234/api/Userinvoice/user-invoices", config)
            .then(function (response) {
                $scope.orders = response.data;  // Lưu dữ liệu đơn hàng vào $scope.orders
            })
            .catch(handleForbiddenError);

        // Fetch milk sales details
        $http
            .get("http://160.30.21.47:1234/api/Invoicedetail/milk-sales-details", config)
            .then(function (response) {
                $scope.milkSalesDetails = response.data;
            })
            .catch(handleForbiddenError);

        // Fetch the invoice summary
        $http
            .get("http://160.30.21.47:1234/api/Invoicedetail/invoice-summary", config)
            .then(function (response) {
                $scope.invoiceSummary = response.data;
            })
            .catch(handleForbiddenError);

        // Fetch the transaction history from the new API
        $http
            .get("http://160.30.21.47:1234/api/payment/historyBank", config)
            .then(function (response) {
                $scope.transactionHistoryList = response.data.transactionHistoryList;
            })
            .catch(handleForbiddenError);
    }
]);
