var app = angular.module("myApp", ["ngRoute"]);
app.run(function ($rootScope, $location) {
  // Check if user is already logged in on app load
  const token = localStorage.getItem("authToken");
  if (token) {
    const userInfo = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    if (userInfo.role === "Admin") {
      $rootScope.isLoggedIn = true;
    } else {
      $rootScope.isLoggedIn = false;
      localStorage.removeItem("authToken");
      localStorage.removeItem("userInfo");
    }
  } else {
    $rootScope.isLoggedIn = false;
  }

  // Redirect to login if not authenticated and trying to access protected routes
  $rootScope.$on("$routeChangeStart", function (event, next) {
    if (next.resolve && !localStorage.getItem("authToken")) {
      $location.path("/login");
    }
  });
});
app.config(function ($routeProvider) {
  // Require authentication function that checks token from localStorage
  function requireAuth($location, $rootScope) {
    if (!localStorage.getItem("authToken")) {
      $location.path("/login");
    }
  }

  // Define routes with authentication requirements
  $routeProvider
    .when("/login", {
      templateUrl: "/views/login.html",
      controller: "LoginController",
    })
    .when("/home", {
      templateUrl: "/views/home.html",
      controller: "",
      resolve: { auth: requireAuth },
    })
    .when("/form-add-don-hang", {
      templateUrl: "/views/form-add-don-hang.html",
      controller: "",
      resolve: { auth: requireAuth },
    })
    .when("/form-add-nhan-vien", {
      templateUrl: "/views/form-add-nhan-vien.html",
      controller: "",
      resolve: { auth: requireAuth },
    })
    .when("/form-add-san-pham", {
      templateUrl: "/views/form-add-san-pham.html",
      controller: "",
      resolve: { auth: requireAuth },
    })
    .when("/quan-ly-bao-cao", {
      templateUrl: "/views/quan-ly-bao-cao.html",
      controller: "",
      resolve: { auth: requireAuth },
    })
    .when("/table-data-khach-hang", {
      templateUrl: "/views/table-data-khach-hang.html",
      controller: "",
      resolve: { auth: requireAuth },
    })
    .when("/table-data-oder", {
      templateUrl: "/views/table-data-oder.html",
      controller: "",
      resolve: { auth: requireAuth },
    })
    .when("/table-data-product", {
      templateUrl: "/views/table-data-product.html",
      controller: "",
      resolve: { auth: requireAuth },
    })
    .when("/table-data-table", {
      templateUrl: "/views/table-data-table.html",
      controller: "",
      resolve: { auth: requireAuth },
    })
    .otherwise({
      redirectTo: "/home",
    });
});

// Login Controller with login and logout functions
app.controller(
  "LoginController",
  function ($scope, $http, $rootScope, $location) {
    $scope.user = {}; // Initialize user object

    function parseJwt(token) {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(base64));
    }

    // Login function
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

      $http
        .post("http://160.30.21.47:1234/api/user/authenticate", {
          username: $scope.user.username,
          password: $scope.user.password,
        })
        .then(
          function success(response) {
            const token = response.data.token;
            if (token) {
              const userInfo = parseJwt(token);

              if (userInfo.role === "Admin") {
                localStorage.setItem("authToken", token);
                localStorage.setItem("userInfo", JSON.stringify(userInfo));
                $rootScope.isLoggedIn = true;

                Swal.fire({
                  icon: "success",
                  title: "Thành công!",
                  text: "Đăng nhập thành công! Chào mừng Admin.",
                  confirmButtonText: "OK",
                  timer: 3000,
                }).then(() => {
                  $location.path("/home");
                  $scope.$apply();
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
                text: "Đăng nhập thất bại. Vui lòng thử lại.",
                confirmButtonText: "OK",
              });
            }
          },
          function error(response) {
            let errorMessage = "Đăng nhập thất bại. Vui lòng thử lại.";
            if (response.status === 401) {
              errorMessage =
                response.data.error ||
                "Sai tên đăng nhập hoặc mật khẩu. Vui lòng kiểm tra và thử lại.";
            }

            Swal.fire({
              icon: "error",
              title: "Lỗi!",
              text: errorMessage,
              confirmButtonText: "OK",
            });
          }
        );
    };

    // Logout function
    $scope.logout = function () {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userInfo");
      $rootScope.isLoggedIn = false;

      Swal.fire({
        icon: "info",
        title: "Đăng xuất thành công!",
        text: "Bạn đã đăng xuất khỏi tài khoản.",
        confirmButtonText: "OK",
        timer: 3000,
      }).then(() => {
        $location.path("/login");
        $scope.$apply();
      });
    };
  }
);
