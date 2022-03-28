import { Component, Input, OnInit } from '@angular/core';
import { NbThemeService } from '@nebular/theme';

@Component({
  selector: 'fc-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Input() theme = 'Dark Mode';
  checked: boolean = true;

  constructor(private themeService: NbThemeService) { }

  ngOnInit(): void {
  }

  toggleTheme(event: boolean): void {
    this.checked = event;
    if (this.checked){
      this.theme = 'Light Mode';
      this.themeService.changeTheme('cosmic');
    }else{
      this.theme = 'Dark Mode';
      this.themeService.changeTheme('default');
    }
  }
}
