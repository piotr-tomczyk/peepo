terraform {
  backend "gcs" {
    bucket  = "terraform-state-peepo-bot"
  }
}

provider "google" {
  project = var.gcp_project
  region = var.gcp_region
}

resource "google_compute_instance" "default" {
  name         = "peepo-vm"
  machine_type = "e2-micro"
  zone         = "us-central1-a"
  metadata_startup_script = file("../startup.sh")

  boot_disk {
    initialize_params {
      image = "debian-12-bookworm-v20240709"
    }
  }

  network_interface {
    network = "default"
    access_config {}
  }
}
