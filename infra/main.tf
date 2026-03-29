terraform {
  required_providers {
    fly = {
      source = "fly-apps/fly"
    }
  }
}

provider "fly" {}

resource "fly_app" "zlinebot" {
  name = "zlinebot-app"
  org  = "personal"
}

resource "fly_machine" "worker" {
  app = fly_app.zlinebot.name

  config {
    image = "registry.fly.io/zlinebot-worker:latest"
  }
}
