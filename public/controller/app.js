var app = angular.module("myApp", ["ngRoute"]);

app.run(function ($rootScope, $location) {
  const token = localStorage.getItem("authToken");

  if (token) {
    const userInfo = JSON.parse(
        atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );

    $rootScope.isLoggedIn = userInfo.role === "Admin" || userInfo.role === "Staff";
    $rootScope.userRole = userInfo.role; // Save user role for access control

    if (!$rootScope.isLoggedIn) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userInfo");
    }
  } else {
    $rootScope.isLoggedIn = false;
  }

  // Logout function
  $rootScope.logout = function () {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userInfo");
    $rootScope.isLoggedIn = false;
    $location.path("/login");
  };

  // Route access control
  $rootScope.$on("$routeChangeStart", function (event, next) {
    if (next.originalPath === "/login") {
      $rootScope.logout();
    } else if (next.resolve && !localStorage.getItem("authToken")) {
      $location.path("/login");
    } else if ($rootScope.isLoggedIn) {
      // Define allowed routes for each role
      const adminRoutes = [
        "/home",
        "/form-add-don-hang",
        "/form-add-nhan-vien",
        "/form-add-san-pham",
        "/quan-ly-bao-cao",
        "/table-data-khach-hang",
        "/table-data-oder",
        "/table-data-product",
        "/table-data-table",
      ];

      const staffRoutes = [
        "/home",
        "/table-data-khach-hang",
        "/table-data-oder",
        "/form-add-don-hang",
        "/form-add-san-pham",
        "/table-data-product",
      ];

      const userRoutes =
          $rootScope.userRole === "Admin" ? adminRoutes : staffRoutes;

      if (!userRoutes.includes(next.originalPath)) {
        Swal.fire({
          icon: "error",
          title: "Quyền truy cập bị từ chối",
          text: "Bạn không có quyền truy cập vào trang này.",
          confirmButtonText: "OK",
        }).then(() => {
          $location.path("/home");
        });
        event.preventDefault();
      }
    }
  });
});

app.config(function ($routeProvider, $locationProvider) {
  function requireAuth($location) {
    return function () {
      if (!localStorage.getItem("authToken")) {
        $location.path("/login");
      }
    };
  }

  $routeProvider
      .when("/login", {
        templateUrl: "/views/login.html",
        controller: "LoginController",
      })
      .when("/home", {
        templateUrl: "/views/home.html",
        resolve: { auth: requireAuth },
      })
      .when("/form-add-don-hang", {
        templateUrl: "/views/form-add-don-hang.html",
        resolve: { auth: requireAuth },
      })
      .when("/form-add-nhan-vien", {
        templateUrl: "/views/form-add-nhan-vien.html",
        resolve: { auth: requireAuth },
      })
      .when("/form-add-san-pham", {
        templateUrl: "/views/form-add-san-pham.html",
        resolve: { auth: requireAuth },
      })
      .when("/quan-ly-bao-cao", {
        templateUrl: "/views/quan-ly-bao-cao.html",
        resolve: { auth: requireAuth },
      })
      .when("/table-data-khach-hang", {
        templateUrl: "/views/table-data-khach-hang.html",
        resolve: { auth: requireAuth },
      })
      .when("/table-data-oder", {
        templateUrl: "/views/table-data-oder.html",
        resolve: { auth: requireAuth },
      })
      .when("/table-data-product", {
        templateUrl: "/views/table-data-product.html",
        resolve: { auth: requireAuth },
      })
      .when("/table-data-table", {
        templateUrl: "/views/table-data-table.html",
        resolve: { auth: requireAuth },
      })
      .otherwise({
        redirectTo: "/home",
      });

  $locationProvider.html5Mode(true);
});