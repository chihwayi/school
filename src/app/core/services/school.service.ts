import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SchoolConfig } from '../../models/school-config.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SchoolService {
  private apiUrl = `${environment.apiUrl}/api/school`;

  constructor(private http: HttpClient) { }

  /**
   * Check if the school is configured
   */
  checkSchoolConfiguration(): Observable<{ configured: boolean, school?: SchoolConfig }> {
    return this.http.get<{ configured: boolean, school?: SchoolConfig }>(`${this.apiUrl}/config`);
  }

  /**
   * Setup the school for the first time
   * @param schoolData The school configuration data
   * @param logo The school logo file
   * @param background The background image file
   */
  setupSchool(schoolData: SchoolConfig, logo?: File, background?: File): Observable<SchoolConfig> {
    const formData = new FormData();
    
    // Append school config as JSON
    formData.append('schoolConfig', new Blob([JSON.stringify(schoolData)], { type: 'application/json' }));

    // Append files if provided
    if (logo) {
      formData.append('logo', logo, logo.name);
    }
    
    if (background) {
      formData.append('background', background, background.name);
    }

    return this.http.post<SchoolConfig>(`${this.apiUrl}/setup`, formData);
  }

  /**
   * Update the school configuration
   * @param id The school id
   * @param schoolData The updated school configuration data
   * @param logo The school logo file
   * @param background The background image file
   */
  updateSchool(id: number, schoolData: SchoolConfig, logo?: File, background?: File): Observable<SchoolConfig> {
    const formData = new FormData();
    
    // Append school config as JSON
    formData.append('schoolConfig', new Blob([JSON.stringify(schoolData)], { type: 'application/json' }));

    // Append files if provided
    if (logo) {
      formData.append('logo', logo, logo.name);
    }
    
    if (background) {
      formData.append('background', background, background.name);
    }

    return this.http.put<SchoolConfig>(`${this.apiUrl}/${id}`, formData);
  }
}