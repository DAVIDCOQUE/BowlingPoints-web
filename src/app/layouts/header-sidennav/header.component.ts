import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  @ViewChild('sidenav') sidenav: MatSidenav | undefined;
  isExpanded = true;
  showSubmenu: boolean = false;
  isShowing = false;
  showSubSubMenu: boolean = false;

  page: string = 'Torneos';

  items = [
    {
      image:
        'https://www.libovalle.com/wp-content/uploads/2024/05/VALLE-CAMPEON-2024.jpg',
      title: 'Valle Campeon 2024',
      description:
        'Commodo nisi fugiat enim mollit tempor commodo nulla. Elit velit duis est incididunt sit nisi amet aliquip. Ea nostrud magna mollit cupidatat magna sit culpa Lorem anim excepteur duis enim. Voluptate et exercitation dolor ea Lorem duis elit ut consectetur. Excepteur culpa in elit eiusmod tempor excepteur commodo voluptate cillum voluptate ullamco.',
    },
    {
      image: 'ruta/a/tu/imagen2.jpg',
      title: 'Proximo torneos',
      description: 'Descripción 2',
    },
    {
      image: 'ruta/a/tu/imagen3.jpg',
      title: 'Contatanos',
      description: 'Descripción 3',
    },
    // Agrega más items según sea necesario
  ];
  constructor(private router: Router) {}

  mouseenter() {
    if (!this.isExpanded) {
      this.isShowing = true;
    }
  }

  mouseleave() {
    if (!this.isExpanded) {
      this.isShowing = false;
    }
  }

  login() {
    this.router.navigate(['']);
  }
}
