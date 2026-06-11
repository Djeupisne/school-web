import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DataTableComponent } from './components/data-table/data-table.component';
import { GradeFormatPipe } from './pipes/grade-format.pipe';

@NgModule({
  declarations: [NavbarComponent, SidebarComponent, DataTableComponent, GradeFormatPipe],
  imports: [CommonModule, RouterModule],
  exports: [NavbarComponent, SidebarComponent, DataTableComponent, GradeFormatPipe]
})
export class SharedModule { }