from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User


class LoginTestCase(TestCase):
    def setUp(self):
        # self.user = User.objects.create_user(
        #     username='testuser',
        #     password='testpassword',
        #     email='test@example.com'
        # )
        self.login_url = reverse('login')

    def test_login_with_valid_credentials(self):
        response = self.client.post(self.login_url, {
            'username': 'pujanlami@gmail.com',
            'password': 'Pujan@123'
        })
        print(response)
        # Assert that the login was successful and the user was redirected
        self.assertEqual(response.status_code, 302)

    def test_login_with_invalid_credentials(self):
        response = self.client.post(self.login_url, {
            'username': 'pujanlami@gmail.com',
            'password': 'Pujan@1234'
        })
        # Assert that the login was unsuccessful and the user was not redirected
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'login.html')
        self.assertContains(response, 'Invalid username or password.')

    def test_login_with_missing_credentials(self):
        response = self.client.post(self.login_url, {})
        # Assert that the login was unsuccessful and the user was not redirected
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'login.html')
        self.assertContains(response, 'This field is required.')
