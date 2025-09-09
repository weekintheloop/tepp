import requests
import sys
import json
from datetime import datetime, date
from typing import Dict, Any

class SIGTEAPITester:
    def __init__(self, base_url="https://sig-theme-upgrade.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")
        return success

    def make_request(self, method: str, endpoint: str, data: Dict[Any, Any] = None, expected_status: int = 200) -> tuple[bool, Dict[Any, Any]]:
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method.upper() == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method.upper() == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method.upper() == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method.upper() == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                return False, {"error": f"Unsupported method: {method}"}

            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"status_code": response.status_code, "text": response.text}

            return success, response_data

        except requests.exceptions.RequestException as e:
            return False, {"error": str(e)}

    def test_api_root(self):
        """Test API root endpoint"""
        success, response = self.make_request('GET', '/')
        if success and response.get('message'):
            return self.log_test("API Root", True, f"- {response.get('message')}")
        else:
            return self.log_test("API Root", False, f"- Response: {response}")

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        self.test_email = f"admin_test_{timestamp}@sigte.com"
        test_user_data = {
            "nome": "Test Admin",
            "email": self.test_email,
            "celular": "(61) 99999-9999",
            "role": "admin",
            "senha": "admin123"
        }
        
        success, response = self.make_request('POST', '/auth/register', test_user_data, 200)
        if success and response.get('id'):
            self.user_id = response.get('id')
            return self.log_test("User Registration", True, f"- User ID: {self.user_id}")
        else:
            return self.log_test("User Registration", False, f"- Response: {response}")

    def test_user_login(self, email=None, password=None):
        """Test user login with demo credentials"""
        if not email:
            email = "admin@sigte.com"
        if not password:
            password = "admin123"
            
        login_data = {
            "email": email,
            "senha": password
        }
        
        success, response = self.make_request('POST', '/auth/login', login_data, 200)
        if success and response.get('access_token'):
            self.token = response['access_token']
            user_info = response.get('user', {})
            return self.log_test("User Login", True, f"- Role: {user_info.get('role')}, Name: {user_info.get('nome')}")
        else:
            return self.log_test("User Login", False, f"- Response: {response}")

    def test_auth_me(self):
        """Test getting current user info"""
        if not self.token:
            return self.log_test("Auth Me", False, "- No token available")
        
        success, response = self.make_request('GET', '/auth/me', expected_status=200)
        if success and response.get('id'):
            return self.log_test("Auth Me", True, f"- User: {response.get('nome')}")
        else:
            return self.log_test("Auth Me", False, f"- Response: {response}")

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        if not self.token:
            return self.log_test("Dashboard Stats", False, "- No token available")
        
        success, response = self.make_request('GET', '/dashboard/stats', expected_status=200)
        if success and 'total_alunos' in response:
            stats = f"Alunos: {response.get('total_alunos')}, Rotas: {response.get('total_rotas_ativas')}, Veículos: {response.get('total_veiculos')}"
            return self.log_test("Dashboard Stats", True, f"- {stats}")
        else:
            return self.log_test("Dashboard Stats", False, f"- Response: {response}")

    def test_advanced_dashboard_analytics(self):
        """Test advanced dashboard analytics endpoint"""
        if not self.token:
            return self.log_test("Advanced Dashboard Analytics", False, "- No token available")
        
        success, response = self.make_request('GET', '/analytics/dashboard', expected_status=200)
        if success:
            return self.log_test("Advanced Dashboard Analytics", True, f"- Analytics data loaded")
        else:
            return self.log_test("Advanced Dashboard Analytics", False, f"- Response: {response}")

    def test_frequency_trends(self):
        """Test frequency trends analytics"""
        if not self.token:
            return self.log_test("Frequency Trends", False, "- No token available")
        
        success, response = self.make_request('GET', '/analytics/frequency-trends?days=7', expected_status=200)
        if success and isinstance(response, dict):
            return self.log_test("Frequency Trends", True, f"- Trends data available")
        else:
            return self.log_test("Frequency Trends", False, f"- Response: {response}")

    def test_route_efficiency(self):
        """Test route efficiency analytics"""
        if not self.token:
            return self.log_test("Route Efficiency", False, "- No token available")
        
        success, response = self.make_request('GET', '/analytics/route-efficiency', expected_status=200)
        if success and isinstance(response, dict):
            return self.log_test("Route Efficiency", True, f"- Efficiency data available")
        else:
            return self.log_test("Route Efficiency", False, f"- Response: {response}")

    def test_risk_students(self):
        """Test students at risk analytics"""
        if not self.token:
            return self.log_test("Risk Students", False, "- No token available")
        
        success, response = self.make_request('GET', '/analytics/risk-students?limit=20', expected_status=200)
        if success and isinstance(response, list):
            return self.log_test("Risk Students", True, f"- Found {len(response)} risk students")
        else:
            return self.log_test("Risk Students", False, f"- Response: {response}")

    def test_maintenance_alerts(self):
        """Test maintenance alerts"""
        if not self.token:
            return self.log_test("Maintenance Alerts", False, "- No token available")
        
        success, response = self.make_request('GET', '/analytics/maintenance-alerts', expected_status=200)
        if success and isinstance(response, list):
            return self.log_test("Maintenance Alerts", True, f"- Found {len(response)} maintenance alerts")
        else:
            return self.log_test("Maintenance Alerts", False, f"- Response: {response}")

    def test_system_health(self):
        """Test system health check"""
        success, response = self.make_request('GET', '/system/health', expected_status=200)
        if success and response.get('status'):
            status = response.get('status')
            components = response.get('components', {})
            return self.log_test("System Health", True, f"- Status: {status}, DB: {components.get('database', 'unknown')}")
        else:
            return self.log_test("System Health", False, f"- Response: {response}")

    def test_intervention_workflow(self):
        """Test intervention workflow"""
        if not self.token:
            return self.log_test("Intervention Workflow", False, "- No token available")
        
        success, response = self.make_request('POST', '/interventions/workflow', {}, expected_status=200)
        if success:
            return self.log_test("Intervention Workflow", True, f"- Workflow executed")
        else:
            return self.log_test("Intervention Workflow", False, f"- Response: {response}")

    def test_student_risk_analysis(self):
        """Test student risk analysis endpoint"""
        if not self.token:
            return self.log_test("Student Risk Analysis", False, "- No token available")
        
        success, response = self.make_request('GET', '/analytics/student-risk', expected_status=200)
        if success:
            return self.log_test("Student Risk Analysis", True, f"- Risk analysis completed")
        else:
            return self.log_test("Student Risk Analysis", False, f"- Response: {response}")

    def test_system_metrics(self):
        """Test system performance metrics"""
        if not self.token:
            return self.log_test("System Metrics", False, "- No token available")
        
        success, response = self.make_request('GET', '/system/metrics', expected_status=200)
        if success:
            return self.log_test("System Metrics", True, f"- Metrics available")
        else:
            return self.log_test("System Metrics", False, f"- Response: {response}")

    def test_unauthorized_access(self):
        """Test accessing protected endpoint without token"""
        # Temporarily remove token
        temp_token = self.token
        self.token = None
        
        success, response = self.make_request('GET', '/dashboard/stats', expected_status=401)
        # Expect failure (401) for unauthorized access
        test_success = not success and (response.get('status_code') == 401 or 'detail' in response)
        
        # Restore token
        self.token = temp_token
        
        return self.log_test("Unauthorized Access", test_success, "- Correctly blocked unauthorized access")

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting SIG-TE Backend API Tests")
        print("=" * 50)
        
        # Basic connectivity
        self.test_api_root()
        self.test_system_health()
        
        # Authentication flow
        self.test_user_login()  # Try with demo credentials first
        self.test_auth_me()
        self.test_unauthorized_access()
        
        # Dashboard functionality
        self.test_dashboard_stats()
        
        # If login failed, try registration and login with new user
        if not self.token:
            print("\n🔄 Login failed, trying registration...")
            if self.test_user_registration():
                # Try login with registered user
                timestamp = datetime.now().strftime('%H%M%S')
                test_email = f"admin_test_{timestamp}@sigte.com"
                print(f"🔄 Trying login with registered user: {test_email}")
                if self.test_user_login(test_email, "admin123"):
                    self.test_auth_me()
                    self.test_dashboard_stats()

        # Advanced Analytics Tests (only if authenticated)
        if self.token:
            print("\n📊 Testing Advanced Analytics Features...")
            self.test_advanced_dashboard_analytics()
            self.test_frequency_trends()
            self.test_route_efficiency()
            self.test_risk_students()
            self.test_maintenance_alerts()
            self.test_student_risk_analysis()
            self.test_intervention_workflow()
            self.test_system_metrics()

        # Print results
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All backend tests passed!")
            return 0
        else:
            print("⚠️  Some backend tests failed!")
            return 1

def main():
    tester = SIGTEAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())