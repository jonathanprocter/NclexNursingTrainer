{pkgs}: {
  deps = [
    pkgs.python312Packages.process-tests
    pkgs.nano
    pkgs.postgresql
  ];
}
