import requests
import sys
import json
from datetime import datetime
import tempfile
import os
from pathlib import Path

class AdminUploadTester:
    def __init__(self, base_url="https://upload-selector.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = "test_admin_token_123"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details
        })
        
    def create_test_pdf(self):
        """Create a temporary PDF file for testing"""
        # Create a simple PDF content (minimal PDF structure)
        pdf_content = b"""%PDF-1.4
1 0 obj
<</Type/Catalog/Pages 2 0 R>>
endobj
2 0 obj
<</Type/Pages/Kids[3 0 R]/Count 1>>
endobj
3 0 obj
<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>
endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000074 00000 n 
0000000120 00000 n 
trailer
<</Size 4/Root 1 0 R>>
startxref
196
%%EOF"""
        
        temp_file = tempfile.NamedTemporaryFile(suffix='.pdf', delete=False)
        temp_file.write(pdf_content)
        temp_file.close()
        return temp_file.name

    def test_backend_health(self):
        """Test if backend is accessible"""
        try:
            response = requests.get(f"{self.base_url}/api/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                success = data.get("message") == "Hello World"
                self.log_test("Backend Health Check", success, f"Status: {response.status_code}, Message: {data}")
                return success
            else:
                self.log_test("Backend Health Check", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Backend Health Check", False, f"Connection error: {str(e)}")
            return False

    def test_upload_without_auth(self):
        """Test upload endpoint without authentication"""
        try:
            pdf_path = self.create_test_pdf()
            
            with open(pdf_path, 'rb') as pdf_file:
                files = {'pdf': ('test.pdf', pdf_file, 'application/pdf')}
                data = {
                    'title': 'Test Document',
                    'doc_type': 'state_regulation'
                }
                
                response = requests.post(
                    f"{self.base_url}/api/admin/upload",
                    files=files,
                    data=data,
                    timeout=30
                )
                
            os.unlink(pdf_path)  # Clean up temp file
            
            # Should return 401 unauthorized
            success = response.status_code == 401
            self.log_test("Upload Without Auth (Should Fail)", success, f"Status: {response.status_code}")
            return success
            
        except Exception as e:
            self.log_test("Upload Without Auth (Should Fail)", False, f"Error: {str(e)}")
            return False

    def test_upload_with_auth_state_regulation(self):
        """Test upload with authentication - state_regulation doc_type"""
        try:
            pdf_path = self.create_test_pdf()
            
            with open(pdf_path, 'rb') as pdf_file:
                files = {'pdf': ('test_state_reg.pdf', pdf_file, 'application/pdf')}
                data = {
                    'title': 'Test State Regulation Document',
                    'doc_type': 'state_regulation',
                    'slug': 'test-state-regulation',
                    'summary': 'Test summary for state regulation'
                }
                
                headers = {'Authorization': f'Bearer {self.token}'}
                
                response = requests.post(
                    f"{self.base_url}/api/admin/upload",
                    files=files,
                    data=data,
                    headers=headers,
                    timeout=30
                )
                
            os.unlink(pdf_path)  # Clean up temp file
            
            success = response.status_code == 200
            if success:
                result = response.json()
                success = all([
                    result.get('success') is True,
                    result.get('doc_type') == 'state_regulation',
                    'document_id' in result
                ])
                self.log_test("Upload State Regulation Doc", success, f"Response: {result}")
            else:
                try:
                    error_detail = response.json()
                except:
                    error_detail = response.text
                self.log_test("Upload State Regulation Doc", success, f"Status: {response.status_code}, Error: {error_detail}")
            
            return success
            
        except Exception as e:
            self.log_test("Upload State Regulation Doc", False, f"Error: {str(e)}")
            return False

    def test_upload_with_auth_pms_report(self):
        """Test upload with authentication - pms_report_requests doc_type"""
        try:
            pdf_path = self.create_test_pdf()
            
            with open(pdf_path, 'rb') as pdf_file:
                files = {'pdf': ('test_pms_report.pdf', pdf_file, 'application/pdf')}
                data = {
                    'title': 'Test PMS Report Request Document',
                    'doc_type': 'pms_report_requests',
                    'slug': 'test-pms-report',
                    'summary': 'Test summary for PMS report request'
                }
                
                headers = {'Authorization': f'Bearer {self.token}'}
                
                response = requests.post(
                    f"{self.base_url}/api/admin/upload",
                    files=files,
                    data=data,
                    headers=headers,
                    timeout=30
                )
                
            os.unlink(pdf_path)  # Clean up temp file
            
            success = response.status_code == 200
            if success:
                result = response.json()
                success = all([
                    result.get('success') is True,
                    result.get('doc_type') == 'pms_report_requests',
                    'document_id' in result
                ])
                self.log_test("Upload PMS Report Doc", success, f"Response: {result}")
            else:
                try:
                    error_detail = response.json()
                except:
                    error_detail = response.text
                self.log_test("Upload PMS Report Doc", success, f"Status: {response.status_code}, Error: {error_detail}")
            
            return success
            
        except Exception as e:
            self.log_test("Upload PMS Report Doc", False, f"Error: {str(e)}")
            return False

    def test_upload_invalid_file_type(self):
        """Test upload with invalid file type"""
        try:
            # Create a text file instead of PDF
            temp_file = tempfile.NamedTemporaryFile(suffix='.txt', delete=False)
            temp_file.write(b"This is not a PDF file")
            temp_file.close()
            
            with open(temp_file.name, 'rb') as txt_file:
                files = {'pdf': ('test.txt', txt_file, 'text/plain')}
                data = {
                    'title': 'Test Document',
                    'doc_type': 'state_regulation'
                }
                
                headers = {'Authorization': f'Bearer {self.token}'}
                
                response = requests.post(
                    f"{self.base_url}/api/admin/upload",
                    files=files,
                    data=data,
                    headers=headers,
                    timeout=30
                )
                
            os.unlink(temp_file.name)  # Clean up temp file
            
            # Should return 400 bad request
            success = response.status_code == 400
            if success:
                try:
                    error_detail = response.json()
                    success = "PDF" in error_detail.get('detail', '')
                except:
                    pass
            
            self.log_test("Upload Invalid File Type (Should Fail)", success, f"Status: {response.status_code}")
            return success
            
        except Exception as e:
            self.log_test("Upload Invalid File Type (Should Fail)", False, f"Error: {str(e)}")
            return False

    def test_upload_missing_required_fields(self):
        """Test upload without required fields"""
        try:
            pdf_path = self.create_test_pdf()
            
            with open(pdf_path, 'rb') as pdf_file:
                files = {'pdf': ('test.pdf', pdf_file, 'application/pdf')}
                data = {
                    # Missing 'title' field
                    'doc_type': 'state_regulation'
                }
                
                headers = {'Authorization': f'Bearer {self.token}'}
                
                response = requests.post(
                    f"{self.base_url}/api/admin/upload",
                    files=files,
                    data=data,
                    headers=headers,
                    timeout=30
                )
                
            os.unlink(pdf_path)  # Clean up temp file
            
            # Should return 422 validation error
            success = response.status_code == 422
            self.log_test("Upload Missing Title (Should Fail)", success, f"Status: {response.status_code}")
            return success
            
        except Exception as e:
            self.log_test("Upload Missing Title (Should Fail)", False, f"Error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("🧪 Starting Admin Upload Backend Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 50)
        
        # Test basic health check first
        if not self.test_backend_health():
            print("❌ Backend is not accessible. Stopping tests.")
            return False
        
        # Run all upload tests
        self.test_upload_without_auth()
        self.test_upload_with_auth_state_regulation()
        self.test_upload_with_auth_pms_report()
        self.test_upload_invalid_file_type()
        self.test_upload_missing_required_fields()
        
        # Print summary
        print("=" * 50)
        print(f"📊 Tests Summary: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All backend tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

def main():
    tester = AdminUploadTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())