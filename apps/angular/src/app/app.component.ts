import { Component } from '@angular/core';
import { Table } from "@hpcc-js/dgrid";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'my-app';

  ngOnInit() {
    new Table()
      .target("placeholder")
      .render()
      ;
  }

}

