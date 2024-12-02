import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  protected readonly currentYear = computed(() => new Date().getFullYear());

  protected readonly socialLinks: {
    icon: string;
    url: string;
    ariaLabel: string;
  }[] = [
    {
      icon: 'pi pi-facebook',
      url: '#',
      ariaLabel: 'Visitar Facebook',
    },
    {
      icon: 'pi pi-twitter',
      url: '#',
      ariaLabel: 'Visitar Twitter',
    },
    {
      icon: 'pi pi-instagram',
      url: '#',
      ariaLabel: 'Visitar Instagram',
    },
  ];
}
