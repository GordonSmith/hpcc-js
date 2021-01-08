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
      .columns(["Hello", "and", "Welcome"])
      .data([[123, 456, 789]])
      .render()
      ;
  }

}

