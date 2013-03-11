TestCase("TestTest", {

    setUp:function () {

        expectAsserts(2);
        this.testVar = null;
        assertNull("SetUp: Test Variable sollte null sein: ", this.testVar);
    },

    'test Methode': function() {

        this.testVar = 1;
        assertEquals("Test Methode: Test Variable sollte 1 sein: ", this.testVar, 1);
        jstestdriver.console.info("Wert der Testvariable: " + this.testVar);
    },

    tearDown: function() {

        this.testVar = null;
    }
});
