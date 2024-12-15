app.controller(
  "LoginController",
  function ($scope, $http, $rootScope, $location) {
    $scope.user = {};
    $scope.loading = false;

    function parseJwt(token) {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(base64));
    }
    $scope.login = function () {
      if (!$scope.user.username || !$scope.user.password) {
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Vui lòng điền đầy đủ thông tin đăng nhập.",
          confirmButtonText: "OK",
        });
        return;
      }

      $scope.loading = true;

      $http
        .post("http://localhost:1234/api/user/authenticate", {
          username: $scope.user.username,
          password: $scope.user.password,
        })
        .then(
          function success(response) {
            const token = response.data.token;
            if (token) {
              const userInfo = parseJwt(token);

              if (userInfo.role === "Admin" || userInfo.role === "Staff") {
                localStorage.setItem("authToken", token);
                localStorage.setItem("userInfo", JSON.stringify(userInfo));
                $rootScope.isLoggedIn = true;
                $rootScope.userRole = userInfo.role;
                Swal.fire({
                  icon: "success",
                  title: "Thành công!",
                  text: "Đăng nhập thành công!",
                  confirmButtonText: "OK",
                  timer: 3000,
                }).then(() => {
                  window.location.href = "/home";
                });
              } else {
                Swal.fire({
                  icon: "error",
                  title: "Quyền truy cập bị từ chối",
                  text: "Bạn không có quyền truy cập vào trang này.",
                  confirmButtonText: "OK",
                });
              }
            } else {
              Swal.fire({
                icon: "error",
                title: "Lỗi!",
                text: "Đăng nhập thất bại.",
                confirmButtonText: "OK",
              });
            }
          },
          function error(response) {
            let errorMessage = "Đăng nhập thất bại.";
            if (response.status === 401) {
              errorMessage =
                response.data.error || "Sai tên đăng nhập hoặc mật khẩu.";
            }

            Swal.fire({
              icon: "error",
              title: "Lỗi!",
              text: errorMessage,
              confirmButtonText: "OK",
            });
          }
        )
        .finally(function () {
          $scope.loading = false;
        });
    };
  }
);
