app.controller("indexController", [
  "$scope",
  "$http",
  function ($scope, $http) {
    const token = localStorage.getItem("authToken");

    // Set up the headers with the token
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // Fetch top 5 users with authorization token
    $http
      .get("http://localhost:1234/api/user/findTop5", config)
      .then(function (response) {
        $scope.customers = response.data;
      })
      .catch(function (error) {
        console.error("Error fetching top 5 users:", error);
      });

    // Fetch the count of Milkdetail items with low stock with authorization token
    $http
      .get("http://localhost:1234/api/Milkdetail/low-stock-count", config)
      .then(function (response) {
        $scope.countend = response.data;
        console.log(response);
      })
      .catch(function (error) {
        console.error("Error fetching low stock count:", error);
      });
    $http
      .get("http://localhost:1234/api/Milkdetail/count-milkdetail", config)
      .then(function (response) {
        $scope.countmilkdetail = response.data;
        console.log(response);
      })
      .catch(function (error) {
        console.error("Error fetching low stock count:", error);
      });
    $http
      .get("http://localhost:1234/api/Invoice/count/current", config)
      .then(function (response) {
        $scope.countinvoice = response.data;
        console.log(response);
      })
      .catch(function (error) {
        console.error("Error fetching low stock count:", error);
      });
    $http
      .get("http://localhost:1234/api/user/count", config)
      .then(function (response) {
        $scope.countuser = response.data;
        console.log(response);
      })
      .catch(function (error) {
        console.error("Error fetching low stock count:", error);
      });
  },
]);
