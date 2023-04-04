import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataTableConstants {
  private usuariosPendencias: string[] = [];
  public static PageSize: number[] = [10, 50, 100, 200, 500];
  public static AllowFiltering: boolean = true;

  setUsuariosPendencias(usuarios: string[]) {
    this.usuariosPendencias = usuarios;
  }

  getUsuariosPendencias(): string[] {
    return this.usuariosPendencias;
  }
}
