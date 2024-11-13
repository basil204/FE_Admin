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

  // Logout function
  $rootScope.logout = function () {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userInfo");
    $rootScope.isLoggedIn = false;
    $location.path("/login");
  };

  // Redirect to login if not authenticated and trying to access protected routes
  $rootScope.$on("$routeChangeStart", function (event, next) {
    // Check if the user navigates to /login to perform a logout
    if (next.originalPath === "/login") {
      $rootScope.logout(); // Perform logout if /login is accessed
    } else if (next.resolve && !localStorage.getItem("authToken")) {
      $location.path("/login");
    }
  });
});

app.config(function ($routeProvider, $locationProvider) {
  // Require authentication function that checks token from localStorage
  function requireAuth($location) {
    return function () {
      if (!localStorage.getItem("authToken")) {
        $location.path("/login");
      }
    };
  }

  // Define routes with authentication requirements
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
