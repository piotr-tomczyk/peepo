terraform {
  backend "gcs" {
    bucket  = "terraform-state-peepo-bot"
    prefix = "terraform/state"
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

resource "google_secret_manager_secret" "discord-token" {
  secret_id = "discord-token"
}

resource "google_secret_manager_secret" "openapi-token" {
  secret_id = "openapi-token"
}

resource "google_secret_manager_secret" "tenorapi-token" {
  secret_id = "tenorapi-token"
}

resource "google_secret_manager_secret" "textchannel-id" {
  secret_id = "textchannel-id"
}

resource "google_secret_manager_secret" "gifchannel-id" {
  secret_id = "gifchannel-id"
}

resource "google_secret_manager_secret" "guild-id" {
  secret_id = "guild-id"
}
