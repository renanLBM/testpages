import { Component } from '@angular/core';

@Component({
  selector: 'fc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'facControl';

  reciverFeedback(event: Event){
    console.log(event);
  }
}
