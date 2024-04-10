import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@awesome-cordova-plugins/status-bar';
import { EmployeeService } from './services/employee.service';
import { SplashScreen } from '@capacitor/splash-screen';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private platform: Platform, private employeeService: EmployeeService) {
    this.initApp();
    this.platform.ready().then(async () => {
      this.platform.backButton.subscribeWithPriority(
        666666, () => {
          App.exitApp();
        });

      this.setStatusBarOverlayWebView();
    });
  }

  async initApp() {
    await this.employeeService.initialize();
    SplashScreen.hide();
  }

  setStatusBarOverlayWebView() {
    const capacitorPlatform = Capacitor.getPlatform();

    if (capacitorPlatform !== "web") {
      StatusBar.overlaysWebView(false);
    }
  }
}
